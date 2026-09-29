import { BaseRepository } from './baseRepository.js';
import Order from '../models/Order.js';

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  // ✅ CRITICAL: Override create() to trigger pre('save') hook
  async create(data) {
    console.log('🔍 orderRepository.create() called');
    console.log('🔍 data:', data);
    
    const order = new this.model(data);
    console.log('🔍 order instance created:', order);
    
    await order.save();
    console.log('✅ order saved successfully');
    return order;
  }

  async findByOrderId(storeId, orderId) {
    return this.model.findOne({ storeId, orderId });
  }

  async findByCustomerId(storeId, customerId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const filter = { storeId, customerId };
    const docs = await this.model.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await this.model.countDocuments(filter);
    return { docs, total, page, limit };
  }

  async findByStatus(storeId, status, options = {}) {
    const { page = 1, limit = 20 } = options;
    const filter = { storeId, orderStatus: status };
    const docs = await this.model.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await this.model.countDocuments(filter);
    return { docs, total, page, limit };
  }

  async updateStatus(id, status, storeId, note = '') {
    const update = {
      orderStatus: status,
      $push: { timeline: { status, note, timestamp: new Date() } },
    };
    return this.model.findOneAndUpdate({ _id: id, storeId }, update, { new: true });
  }

  async getRevenueSummary(storeId, startDate, endDate) {
    const result = await this.model.aggregate([
      { $match: { storeId, orderStatus: 'Delivered', createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]);
    return result[0] || { total: 0, count: 0 };
  }

  async getDailyRevenue(storeId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return this.model.aggregate([
      { $match: { storeId, orderStatus: 'Delivered', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }
}

export default new OrderRepository();