import { BaseRepository } from './baseRepository.js';
import Store from '../models/Store.js';

class StoreRepository extends BaseRepository {
  constructor() {
    super(Store);
  }

  async findBySlug(slug) {
    return this.model.findOne({ slug });
  }

  async findBySubdomain(subdomain) {
    return this.model.findOne({ subdomain });
  }

  async findByOwnerId(ownerId) {
    return this.model.find({ ownerId });
  }

  async updateStatus(id, status) {
    return this.model.findByIdAndUpdate(id, { status }, { new: true });
  }
}

export default new StoreRepository();
