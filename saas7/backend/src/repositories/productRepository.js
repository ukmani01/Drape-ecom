import { BaseRepository } from './baseRepository.js';
import Product from '../models/Product.js';

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  // ✅ Find product by ID with store isolation
  async findById(id, storeId) {
    return this.model.findOne({ _id: id, storeId });
  }

  // ✅ Find product by slug
  async findBySlug(storeId, slug) {
    return this.model.findOne({ storeId, slug });
  }

  // ✅ Search products
  async search(storeId, query, options = {}) {
    const { page = 1, limit = 20 } = options;
    const filter = {
      storeId,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [query] } },
      ],
    };
    const docs = await this.model.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await this.model.countDocuments(filter);
    return { docs, total, page, limit };
  }

  // ✅ Update stock
  async updateStock(storeId, productId, quantity) {
    return this.model.findOneAndUpdate(
      { _id: productId, storeId },
      { $inc: { 'variants.0.stock': -quantity } },
      { new: true }
    );
  }

  // ✅ Update sales
  async updateSales(storeId, productId, quantity) {
    return this.model.findOneAndUpdate(
      { _id: productId, storeId },
      { $inc: { totalSales: quantity } },
      { new: true }
    );
  }

  // ✅ Featured products
  async findFeatured(storeId, limit = 8) {
    return this.model.find({ storeId, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  // ✅ Best sellers
  async findBestSellers(storeId, limit = 8) {
    return this.model.find({ storeId })
      .sort({ totalSales: -1 })
      .limit(limit);
  }

  // ✅ New arrivals
  async findNewArrivals(storeId, limit = 8) {
    return this.model.find({ storeId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

export default new ProductRepository();