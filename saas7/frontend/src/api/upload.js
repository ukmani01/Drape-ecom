import api from './axios';

export const uploadSingle = (file, folder) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post(`/upload/single?folder=${folder}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const uploadMultiple = (files, folder) => {
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));
  return api.post(`/upload/multiple?folder=${folder}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const uploadProductImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/upload/product', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const uploadHeroImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/upload/hero', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const uploadLogo = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/upload/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const deleteImage = (publicId) => api.delete('/upload/delete', { data: { public_id: publicId } });
export const replaceImage = (oldPublicId, file) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('oldPublicId', oldPublicId);
  return api.post('/upload/replace', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
