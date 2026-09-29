import mongoose from 'mongoose'; // ✅ ADDED – needed for ObjectId validation
import Category from '../models/Category.js';
import ActivityLog from '../models/ActivityLog.js';
import { generateSlug } from '../utils/helpers.js';

// @desc    Get all categories
// @route   GET /api/categories
export const getCategories = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const categories = await Category.find({ storeId })
      .sort({ order: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: {
        docs: categories,
        total: categories.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single category by ID or slug (✅ FIXED)
// @route   GET /api/categories/:id
export const getCategory = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const { id } = req.params;

    let category;

    // Check if id is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      category = await Category.findOne({ _id: id, storeId });
    }

    // If not found or not a valid ObjectId, try as slug
    if (!category) {
      category = await Category.findOne({ storeId, slug: id.toLowerCase() });
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const { slug } = req.params;

    const category = await Category.findOne({
      storeId,
      slug: slug.toLowerCase(),
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create category
// @route   POST /api/categories
export const createCategory = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const { name, description, image, parentId, order, status, seo } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const slug = generateSlug(name);

    const existing = await Category.findOne({
      storeId,
      slug: slug,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists',
      });
    }

    const category = new Category({
      storeId,
      name: name.trim(),
      slug,
      description: description?.trim() || '',
      image: image || '',
      parentId: parentId || null,
      order: order || 0,
      status: status || 'active',
      seo: seo || {},
    });

    await category.save();

    await ActivityLog.create({
      storeId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'CATEGORY_CREATED',
      details: {
        categoryId: category._id,
        name: category.name,
        slug: category.slug,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (err) {
    console.error('Create category error:', err);
    next(err);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
export const updateCategory = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const { name, description, image, parentId, order, status, seo } = req.body;

    const category = await Category.findOne({
      _id: req.params.id,
      storeId,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    if (name && name !== category.name) {
      const newSlug = generateSlug(name);
      const existing = await Category.findOne({
        storeId,
        slug: newSlug,
        _id: { $ne: category._id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists',
        });
      }
      category.name = name.trim();
      category.slug = newSlug;
    }

    if (description !== undefined) category.description = description.trim() || '';
    if (image !== undefined) category.image = image;
    if (parentId !== undefined) category.parentId = parentId || null;
    if (order !== undefined) category.order = order;
    if (status !== undefined) category.status = status;
    if (seo !== undefined) category.seo = seo;

    await category.save();

    await ActivityLog.create({
      storeId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'CATEGORY_UPDATED',
      details: {
        categoryId: category._id,
        name: category.name,
        slug: category.slug,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
export const deleteCategory = async (req, res, next) => {
  try {
    const storeId = req.storeId;

    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      storeId,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    await ActivityLog.create({
      storeId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'CATEGORY_DELETED',
      details: {
        categoryId: category._id,
        name: category.name,
        slug: category.slug,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get category tree (parent with children)
// @route   GET /api/categories/tree
export const getCategoryTree = async (req, res, next) => {
  try {
    const storeId = req.storeId;

    const categories = await Category.find({ storeId })
      .sort({ order: 1, name: 1 });

    const tree = [];
    const map = {};

    categories.forEach(cat => {
      map[cat._id] = {
        ...cat.toObject(),
        children: [],
      };
    });

    categories.forEach(cat => {
      if (cat.parentId && map[cat.parentId]) {
        map[cat.parentId].children.push(map[cat._id]);
      } else {
        tree.push(map[cat._id]);
      }
    });

    res.status(200).json({
      success: true,
      data: tree,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Bulk delete categories
// @route   POST /api/categories/bulk-delete
export const bulkDeleteCategories = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const { ids } = req.body;

    if (!ids || !ids.length) {
      return res.status(400).json({
        success: false,
        message: 'No category IDs provided',
      });
    }

    const result = await Category.deleteMany({
      _id: { $in: ids },
      storeId,
    });

    await ActivityLog.create({
      storeId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'CATEGORIES_BULK_DELETED',
      details: {
        count: result.deletedCount,
        ids,
      },
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} categories deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
};