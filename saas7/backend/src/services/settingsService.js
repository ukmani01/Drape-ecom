import Settings from '../models/Settings.js';

/**
 * Recursively sanitize ObjectId fields:
 * Convert empty strings to null for keys that likely hold ObjectId references.
 */
const sanitizeObjectIds = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObjectIds(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // If value is an object, recurse
    if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObjectIds(value);
      continue;
    }

    // Check if this key looks like an ObjectId reference and value is empty string
    const isIdField = 
      key === 'featuredCategoryId' || 
      key === 'categoryId' || 
      key === 'productId' || 
      key === 'parentId' || 
      key === 'storeId' || 
      key === 'customerId' || 
      key === 'userId' ||
      key === 'planId' ||
      key === 'subscriptionId' ||
      /Id$/.test(key); // any key ending with 'Id'

    if (isIdField && value === '') {
      sanitized[key] = null;
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

export const getSettings = async (storeId) => {
  let settings = await Settings.findOne({ storeId });
  if (!settings) {
    settings = new Settings({ storeId });
    await settings.save();
  }
  return settings;
};

export const updateSettings = async (storeId, data) => {
  const settings = await getSettings(storeId);
  // ✅ Sanitize incoming data to prevent ObjectId cast errors
  const sanitizedData = sanitizeObjectIds(data);
  Object.assign(settings, sanitizedData);
  await settings.save();
  return settings;
};

export const updateBrand = async (storeId, brandData) => {
  const settings = await getSettings(storeId);
  settings.brand = { ...settings.brand, ...brandData };
  await settings.save();
  return settings;
};

export const updateHero = async (storeId, heroData) => {
  const settings = await getSettings(storeId);
  settings.hero = { ...settings.hero, ...heroData };
  await settings.save();
  return settings;
};

export const updateFooter = async (storeId, footerData) => {
  const settings = await getSettings(storeId);
  settings.footer = { ...settings.footer, ...footerData };
  await settings.save();
  return settings;
};

export const updateSEO = async (storeId, seoData) => {
  const settings = await getSettings(storeId);
  settings.seo = { ...settings.seo, ...seoData };
  await settings.save();
  return settings;
};

export const updateShop = async (storeId, shopData) => {
  const settings = await getSettings(storeId);
  settings.shop = { ...settings.shop, ...shopData };
  await settings.save();
  return settings;
};

export const addBanner = async (storeId, bannerData) => {
  const settings = await getSettings(storeId);
  settings.banners = settings.banners || [];
  settings.banners.push(bannerData);
  await settings.save();
  return settings;
};

export const removeBanner = async (storeId, bannerIndex) => {
  const settings = await getSettings(storeId);
  settings.banners = settings.banners.filter((_, i) => i !== bannerIndex);
  await settings.save();
  return settings;
};

export const updateBanner = async (storeId, bannerIndex, bannerData) => {
  const settings = await getSettings(storeId);
  settings.banners[bannerIndex] = { ...settings.banners[bannerIndex], ...bannerData };
  await settings.save();
  return settings;
};

export const addNavItem = async (storeId, navItem) => {
  const settings = await getSettings(storeId);
  settings.navigation = settings.navigation || [];
  settings.navigation.push(navItem);
  await settings.save();
  return settings;
};

export const removeNavItem = async (storeId, navIndex) => {
  const settings = await getSettings(storeId);
  settings.navigation = settings.navigation.filter((_, i) => i !== navIndex);
  await settings.save();
  return settings;
};

export default {
  getSettings,
  updateSettings,
  updateBrand,
  updateHero,
  updateFooter,
  updateSEO,
  updateShop,
  addBanner,
  removeBanner,
  updateBanner,
  addNavItem,
  removeNavItem,
};