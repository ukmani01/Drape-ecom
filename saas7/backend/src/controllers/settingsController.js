import { getSettings, updateSettings, updateBrand, updateHero, updateFooter, updateSEO, updateShop, addBanner, removeBanner, updateBanner, addNavItem, removeNavItem } from '../services/settingsService.js';
import { ActivityLog } from '../models/index.js';

export const getStoreSettings = async (req, res, next) => {
  try {
    const settings = await getSettings(req.storeId);
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

export const updateStoreSettings = async (req, res, next) => {
  try {
    const settings = await updateSettings(req.storeId, req.body);
    await ActivityLog.create({
      storeId: req.storeId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'SETTINGS_UPDATED',
      details: { updatedFields: Object.keys(req.body) },
    });
    res.status(200).json({
      success: true,
      message: 'Settings updated',
      data: settings,
    });
  } catch (err) {
    next(err);
  }
};

export const updateBrandSettings = async (req, res, next) => {
  try {
    const settings = await updateBrand(req.storeId, req.body);
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

export const updateHeroSettings = async (req, res, next) => {
  try {
    const settings = await updateHero(req.storeId, req.body);
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

export const updateFooterSettings = async (req, res, next) => {
  try {
    const settings = await updateFooter(req.storeId, req.body);
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

export const updateSEOSettings = async (req, res, next) => {
  try {
    const settings = await updateSEO(req.storeId, req.body);
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

export const updateShopSettings = async (req, res, next) => {
  try {
    const settings = await updateShop(req.storeId, req.body);
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

export const createBanner = async (req, res, next) => {
  try {
    const settings = await addBanner(req.storeId, req.body);
    await ActivityLog.create({
      storeId: req.storeId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'BANNER_ADDED',
    });
    res.status(201).json({
      success: true,
      message: 'Banner added',
      data: settings,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteBanner = async (req, res, next) => {
  try {
    const { index } = req.params;
    const settings = await removeBanner(req.storeId, parseInt(index));
    await ActivityLog.create({
      storeId: req.storeId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'BANNER_REMOVED',
    });
    res.status(200).json({
      success: true,
      message: 'Banner removed',
      data: settings,
    });
  } catch (err) {
    next(err);
  }
};

export const updateBannerData = async (req, res, next) => {
  try {
    const { index } = req.params;
    const settings = await updateBanner(req.storeId, parseInt(index), req.body);
    res.status(200).json({
      success: true,
      message: 'Banner updated',
      data: settings,
    });
  } catch (err) {
    next(err);
  }
};

export const createNavItem = async (req, res, next) => {
  try {
    const settings = await addNavItem(req.storeId, req.body);
    res.status(201).json({
      success: true,
      message: 'Navigation item added',
      data: settings,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteNavItem = async (req, res, next) => {
  try {
    const { index } = req.params;
    const settings = await removeNavItem(req.storeId, parseInt(index));
    res.status(200).json({
      success: true,
      message: 'Navigation item removed',
      data: settings,
    });
  } catch (err) {
    next(err);
  }
};
