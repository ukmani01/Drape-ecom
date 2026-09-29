// backend/src/repositories/userRepository.js
import { BaseRepository } from './baseRepository.js';
import User from '../models/User.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.model.findOne({ email });
  }

  async findByStoreId(storeId) {
    return this.model.find({ storeId });
  }

  async findByRole(role) {
    return this.model.find({ role });
  }

  async updateLastLogin(userId) {
    return this.model.findByIdAndUpdate(
      userId,
      { lastLogin: new Date() },
      { new: true }
    );
  }

  async updateStatus(userId, status) {
    return this.model.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    );
  }
}

export default new UserRepository();