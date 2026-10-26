import api from './axiosInstance';

export const orderApi = {
  checkout: (checkoutData) => api.post('/orders/checkout', checkoutData),
  verifyPayment: (paymentData) => api.post('/orders/verify-payment', paymentData),
  paymentFailed: (failureData) => api.post('/orders/payment-failed', failureData),
  getMyOrders: (params = {}) => api.get('/orders', { params }),
  getOrderById: (orderId) => api.get(`/orders/${orderId}`),
  cancelOrder: (orderId, reason) => api.patch(`/orders/${orderId}/cancel`, { reason }),
};

export default orderApi;
