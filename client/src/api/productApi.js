import api from './axiosInstance';

export const productApi = {
  // Get active products with pagination, category, search, min/max price, sorting
  getProducts: (params = {}) => api.get('/products', { params }),

  // Get featured products for homepage showcase
  getFeaturedProducts: () => api.get('/products/featured'),

  // Get single product details by URL slug
  getProductBySlug: (slug) => api.get(`/products/${slug}`),

  // Get active product categories
  getCategories: () => api.get('/categories'),
};

export default productApi;
