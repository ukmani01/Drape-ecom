export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    const doc = new this.model(data);
    await doc.save();
    return doc;
  }

  async findById(id, storeId) {
    const query = { _id: id };
    if (storeId) query.storeId = storeId;
    return this.model.findOne(query);
  }

  async findOne(filter, storeId) {
    const query = { ...filter };
    if (storeId) query.storeId = storeId;
    return this.model.findOne(query);
  }

  async find(filter = {}, options = {}) {
    const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;
    const query = { ...filter };
    const docs = await this.model.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await this.model.countDocuments(query);
    return { docs, total, page, limit };
  }

  async update(id, data, storeId) {
    const query = { _id: id };
    if (storeId) query.storeId = storeId;
    return this.model.findOneAndUpdate(query, data, { new: true, runValidators: true });
  }

  async delete(id, storeId) {
    const query = { _id: id };
    if (storeId) query.storeId = storeId;
    return this.model.findOneAndDelete(query);
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }
}
