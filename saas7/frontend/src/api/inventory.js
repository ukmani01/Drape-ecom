import api from './axios';

export const getInventory = (params) => api.get('/inventory', { params });
export const updateInventory = (id, data) => api.put(`/inventory/${id}`, data);
export const bulkUpdateInventory = (data) => api.post('/inventory/bulk', data);
export const getInventoryHistory = (params) => api.get('/inventory/history', { params });
export const exportInventory = () => api.get('/inventory/export', { responseType: 'blob' });
export const importInventory = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/inventory/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
