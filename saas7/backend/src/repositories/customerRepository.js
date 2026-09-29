import { BaseRepository } from './baseRepository.js';
import Customer from '../models/Customer.js';

class CustomerRepository extends BaseRepository {
  constructor() {
    super(Customer);
  }

  async findByEmail(storeId, email) {
    return this.model.findOne({ storeId, email });
  }

  async updateOrderStats(storeId, customerId, orderAmount) {
    return this.model.findOneAndUpdate(
      { _id: customerId, storeId },
      {
        $inc: { totalOrders: 1, lifetimeValue: orderAmount },
        $set: { lastOrderDate: new Date() },
      },
      { new: true }
    );
  }

  async search(storeId, query, options = {}) {
    const { page = 1, limit = 20 } = options;
    const searchRegex = new RegExp(query, 'i');
    const filter = {
      storeId,
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ],
    };
    const docs = await this.model.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await this.model.countDocuments(filter);
    return { docs, total, page, limit };
  }

  async getTopCustomers(storeId, limit = 10) {
    return this.model.find({ storeId })
      .sort({ lifetimeValue: -1 })
      .limit(limit);
  }
}

export default new CustomerRepository();
