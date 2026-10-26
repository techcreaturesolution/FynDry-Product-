import api from './axiosInstance';

export const cartApi = {
  getCart: () => api.get('/cart'),
  addItem: ({ productId, variantId, quantity = 1 }) =>
    api.post('/cart/items', { productId, variantId, quantity }),
  updateItemQuantity: (itemId, quantity) =>
    api.patch(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart'),
  mergeCart: (items) => api.post('/cart/merge', { items }),
};

export default cartApi;
