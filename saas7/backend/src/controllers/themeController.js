// backend/src/controllers/themeController.js
import Theme from '../models/Theme.js';
import Store from '../models/Store.js';

// @desc    Get all themes
// @route   GET /api/themes
export const getThemes = async (req, res, next) => {
  try {
    const themes = await Theme.find({ isActive: true }).sort({ id: 1 });
    res.status(200).json({ success: true, data: themes });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single theme by id
// @route   GET /api/themes/:id
export const getTheme = async (req, res, next) => {
  try {
    const theme = await Theme.findOne({ id: req.params.id });
    if (!theme) throw new Error('Theme not found');
    res.status(200).json({ success: true, data: theme });
  } catch (err) {
    next(err);
  }
};

// @desc    Apply theme to store
// @route   POST /api/themes/apply
export const applyThemeToStore = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const { themeId } = req.body;
    if (!themeId) throw new Error('Theme ID required');
    const theme = await Theme.findOne({ id: themeId });
    if (!theme) throw new Error('Theme not found');
    const store = await Store.findByIdAndUpdate(
      storeId,
      { selectedTheme: themeId },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: 'Theme applied successfully',
      data: { store, theme },
    });
  } catch (err) {
    next(err);
  }
};