import api from './axios';

export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const getProductBySlug = (slug) => api.get(`/products/slug/${slug}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const bulkDeleteProducts = (ids) => api.post('/products/bulk-delete', { ids });
export const updateStock = (id, quantity) => api.patch(`/products/${id}/stock`, { quantity });
export const getFeaturedProducts = (params) => api.get('/products/featured', { params });
export const getBestSellers = (params) => api.get('/products/bestsellers', { params });
export const getNewArrivals = (params) => api.get('/products/newarrivals', { params });

// ✅ NEW: Get related products (exclude the current product)
export const getRelatedProducts = (productId, limit = 4) => {
  return api.get(`/products?limit=${limit + 1}`).then(res => {
    const products = res.data.data?.docs || [];
    const filtered = products.filter(p => p._id !== productId).slice(0, limit);
    return { data: { data: filtered } };
  });
};