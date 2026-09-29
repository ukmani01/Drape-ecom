import { uploadImage, uploadMultiple, deleteImage, updateImage } from '../services/cloudinaryService.js';

export const uploadSingleImage = async (req, res, next) => {
  try {
    if (!req.file) throw new Error('No file uploaded');
    const { storeId } = req.user;
    
    // ✅ FIX: Check if storeId exists
    if (!storeId) throw new Error('Store ID not found for this user. Please complete your store setup.');
    
    const folder = req.query.folder || `stores/${storeId}`;
    const result = await uploadImage(req.file.buffer, folder);
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: result,
    });
  } catch (err) {
    console.error('Upload error:', err);
    next(err);
  }
};

export const uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || !req.files.length) throw new Error('No files uploaded');
    const { storeId } = req.user;
    
    // ✅ FIX: Check if storeId exists
    if (!storeId) throw new Error('Store ID not found for this user. Please complete your store setup.');
    
    const folder = req.query.folder || `stores/${storeId}`;
    const results = await uploadMultiple(req.files, folder);
    res.status(200).json({
      success: true,
      message: `${results.length} images uploaded successfully`,
      data: results,
    });
  } catch (err) {
    console.error('Upload error:', err);
    next(err);
  }
};

export const deleteSingleImage = async (req, res, next) => {
  try {
    const { public_id } = req.body;
    if (!public_id) throw new Error('Public ID required');
    await deleteImage(public_id);
    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const replaceImage = async (req, res, next) => {
  try {
    if (!req.file) throw new Error('No file uploaded');
    const { oldPublicId } = req.body;
    const { storeId } = req.user;
    
    // ✅ FIX: Check if storeId exists
    if (!storeId) throw new Error('Store ID not found for this user. Please complete your store setup.');
    
    const folder = req.query.folder || `stores/${storeId}`;
    const result = await updateImage(oldPublicId, req.file.buffer, folder);
    res.status(200).json({
      success: true,
      message: 'Image replaced successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) throw new Error('No file uploaded');
    const { storeId } = req.user;
    
    // ✅ FIX: Check if storeId exists
    if (!storeId) throw new Error('Store ID not found for this user. Please complete your store setup.');
    
    const folder = `stores/${storeId}/products`;
    const result = await uploadImage(req.file.buffer, folder);
    res.status(200).json({
      success: true,
      message: 'Product image uploaded',
      data: result,
    });
  } catch (err) {
    console.error('Upload error:', err);
    next(err);
  }
};

export const uploadHeroImage = async (req, res, next) => {
  try {
    if (!req.file) throw new Error('No file uploaded');
    const { storeId } = req.user;
    
    // ✅ FIX: Check if storeId exists
    if (!storeId) throw new Error('Store ID not found for this user. Please complete your store setup.');
    
    const folder = `stores/${storeId}/hero`;
    const result = await uploadImage(req.file.buffer, folder);
    res.status(200).json({
      success: true,
      message: 'Hero image uploaded',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) throw new Error('No file uploaded');
    const { storeId } = req.user;
    
    // ✅ FIX: Check if storeId exists
    if (!storeId) throw new Error('Store ID not found for this user. Please complete your store setup.');
    
    const folder = `stores/${storeId}/brand`;
    const result = await uploadImage(req.file.buffer, folder);
    res.status(200).json({
      success: true,
      message: 'Logo uploaded',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};