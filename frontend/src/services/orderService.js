import api from './api';

export const orderService = {
  checkout: async (checkoutData) => {
    // checkoutData: { addressId, paymentMethod }
    return await api.post('/checkout', checkoutData);
  },

  getOrders: async () => {
    return await api.get('/orders');
  },

  getOrderById: async (orderId) => {
    return await api.get(`/orders/${orderId}`);
  }
};
