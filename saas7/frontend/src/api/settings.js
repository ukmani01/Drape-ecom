import api from './axios';

export const getSettings = () => api.get('/settings');
export const updateSettings = (data) => api.put('/settings', data);
export const updateBrand = (data) => api.put('/settings/brand', data);
export const updateHero = (data) => api.put('/settings/hero', data);
export const updateFooter = (data) => api.put('/settings/footer', data);
export const updateSEO = (data) => api.put('/settings/seo', data);
export const updateShop = (data) => api.put('/settings/shop', data);
export const createBanner = (data) => api.post('/settings/banners', data);
export const updateBanner = (index, data) => api.put(`/settings/banners/${index}`, data);
export const deleteBanner = (index) => api.delete(`/settings/banners/${index}`);
export const createNavItem = (data) => api.post('/settings/nav', data);
export const deleteNavItem = (index) => api.delete(`/settings/nav/${index}`);
