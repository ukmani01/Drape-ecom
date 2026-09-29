
import Store from '../models/Store.js';

export const resolveStoreFromSlug = async (req, res, next) => {
  try {
    const storeSlug = req.body.storeSlug || req.query.storeSlug || req.params.storeSlug;
    
    if (!storeSlug) {
      console.warn('⚠️ [Public Middleware] Store slug missing in request:', req.method, req.originalUrl);
      return res.status(400).json({ success: false, message: 'Store slug is required' });
    }

    console.log(`🔍 [Public Middleware] Resolving store for slug: ${storeSlug}`);

    const store = await Store.findOne({ slug: storeSlug });
    if (!store) {
      console.warn(`⚠️ [Public Middleware] Store not found for slug: ${storeSlug}`);
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    req.storeId = store._id;
    req.store = store;
    console.log(`✅ [Public Middleware] Store resolved successfully. ID: ${store._id}, Name: ${store.name}`);
    next();
  } catch (err) {
    console.error('❌ [Public Middleware] Database or internal error:', err.message);
    console.error('❌ [Public Middleware] Stack trace:', err.stack);
    return res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
  }
};
