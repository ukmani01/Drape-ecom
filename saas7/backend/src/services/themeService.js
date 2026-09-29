import Theme from '../models/Theme.js';

export const getThemes = async (filter = {}) => {
  return Theme.find({ isActive: true, ...filter }).sort({ id: 1 });
};

export const getThemeById = async (id) => {
  return Theme.findOne({ id });
};

export const getThemeByStore = async (storeId) => {
  // This will be used with store settings
  return Theme.findOne({ isActive: true });
};

export const applyTheme = async (storeId, themeId) => {
  // Theme application is handled client-side via settings
  // Just validate that the theme exists
  const theme = await getThemeById(themeId);
  if (!theme) throw new Error('Theme not found');
  return theme;
};

export const createTheme = async (data) => {
  const theme = new Theme(data);
  await theme.save();
  return theme;
};

export const updateTheme = async (id, data) => {
  return Theme.findOneAndUpdate({ id }, data, { new: true });
};

export const deleteTheme = async (id) => {
  return Theme.findOneAndDelete({ id });
};

export const getThemeVariables = async (themeId) => {
  const theme = await getThemeById(themeId);
  if (!theme) return {};
  return theme.variables || {};
};

export default {
  getThemes,
  getThemeById,
  getThemeByStore,
  applyTheme,
  createTheme,
  updateTheme,
  deleteTheme,
  getThemeVariables,
};
