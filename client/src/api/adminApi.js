import api from './axiosInstance';

export const adminApi = {
  // Dashboard Analytics
  getDashboardStats: () => api.get('/admin/dashboard'),

  // Orders Management
  getAllOrders: (params = {}) => api.get('/admin/orders', { params }),
  getOrderById: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, data) => api.patch(`/admin/orders/${id}/status`, data),

  // Customers Management
  getCustomers: (params = {}) => api.get('/admin/customers', { params }),
  getCustomerById: (id) => api.get(`/admin/customers/${id}`),

  // Products Management
  getProducts: (params = {}) => api.get('/admin/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (data) =>
    api.post('/admin/products', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
  updateProduct: (id, data) =>
    api.patch(`/admin/products/${id}`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
  bulkUpdateProducts: (productIds, isActive) =>
    api.patch('/admin/products/bulk', { productIds, isActive }),
  updateStock: (id, stockData) => api.patch(`/admin/products/${id}/stock`, stockData),
  toggleProduct: (id) => api.patch(`/admin/products/${id}/toggle`),
  deleteProduct: (id, hard = false) => api.delete(`/admin/products/${id}?hard=${hard}`),

  // Categories Management
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) =>
    api.post('/admin/categories', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
  updateCategory: (id, data) =>
    api.patch(`/admin/categories/${id}`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.patch('/admin/settings', data),
};

export default adminApi;
