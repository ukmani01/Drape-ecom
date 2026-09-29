import api from './axios';

export const getThemes = () => api.get('/themes');
export const getTheme = (id) => api.get(`/themes/${id}`);
export const applyTheme = (themeId) => api.post('/themes/apply', { themeId });
