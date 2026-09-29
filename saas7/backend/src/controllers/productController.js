import mongoose from 'mongoose'; // ✅ ADDED – needed for ObjectId validation
import productRepository from '../repositories/productRepository.js';
import { generateSlug } from '../utils/helpers.js';
import { ActivityLog, Product } from '../models/index.js';

export const listProducts = async (req, res, next) => {
  try {
    const { category, status, featured, search, page, limit, sort } = req.query;
    const filter = { storeId: req.storeId };
    
    // ✅ FIX: Handle category – accept either ID or slug
    if (category) {
      let categoryId = category;
      // If category is not a valid ObjectId, treat as slug and find the category
      if (!mongoose.Types.ObjectId.isValid(category)) {
        const Category = mongoose.model('Category');
        const cat = await Category.findOne({ storeId: req.storeId, slug: category.toLowerCase() });
        if (cat) {
          categoryId = cat._id;
        } else {
          // If no category found, return empty result
          return res.status(200).json({
            success: true,
            data: { docs: [], total: 0, page: 1, limit: 20 }
          });
        }
      }
      filter.categoryId = categoryId;
    }

    if (status) filter.status = status;
    if (featured === 'true') filter.isFeatured = true;

    let result;
    if (search) {
      result = await productRepository.search(req.storeId, search, { page, limit });
    } else {
      result = await productRepository.find(filter, { page, limit, sort });
    }
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await productRepository.findById(req.params.id, req.storeId);
    if (!product) throw new Error('Product not found');
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const productData = {
      ...req.body,
      storeId: req.storeId,
      slug: req.body.slug || generateSlug(req.body.title),
    };
    const product = await productRepository.create(productData);
    await ActivityLog.create({
      storeId: req.storeId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'PRODUCT_CREATED',
      details: { productId: product._id, title: product.title },
    });
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await productRepository.update(req.params.id, req.body, req.storeId);
    if (!product) throw new Error('Product not found');
    await ActivityLog.create({
      storeId: req.storeId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'PRODUCT_UPDATED',
      details: { productId: product._id, title: product.title },
    });
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await productRepository.delete(req.params.id, req.storeId);
    if (!product) throw new Error('Product not found');
    await ActivityLog.create({
      storeId: req.storeId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'PRODUCT_DELETED',
      details: { productId: product._id, title: product.title },
    });
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const bulkDeleteProducts = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !ids.length) throw new Error('No product IDs provided');
    await Product.deleteMany({ _id: { $in: ids }, storeId: req.storeId });
    await ActivityLog.create({
      storeId: req.storeId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'PRODUCTS_BULK_DELETED',
      details: { count: ids.length },
    });
    res.status(200).json({
      success: true,
      message: `${ids.length} products deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
};

export const updateStock = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const product = await productRepository.updateStock(req.storeId, req.params.id, quantity);
    if (!product) throw new Error('Product not found');
    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

export const getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await productRepository.findFeatured(req.storeId, limit);
    res.status(200).json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

export const getBestSellers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await productRepository.findBestSellers(req.storeId, limit);
    res.status(200).json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

export const getNewArrivals = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await productRepository.findNewArrivals(req.storeId, limit);
    res.status(200).json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

export const getProductBySlug = async (req, res, next) => {
  console.log('🚀 ===== getProductBySlug CALLED =====');
  console.log('🚀 Request params:', req.params);
  console.log('🚀 Request storeId from req:', req.storeId);
  console.log('🚀 Request user:', req.user?.email);

  try {
    const storeId = req.storeId || req.user?.storeId;
    const { slug } = req.params;

    console.log('🔍 storeId:', storeId);
    console.log('🔍 slug:', slug);

    if (!storeId) {
      console.error('❌ storeId is missing!');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const product = await Product.findOne({ storeId, slug });
    console.log('🔍 Product with storeId:', product ? 'YES' : 'NO');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    console.error('❌ getProductBySlug error:', err);
    next(err);
  }
};