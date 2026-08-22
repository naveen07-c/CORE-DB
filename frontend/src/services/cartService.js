import api from './api';

export const cartService = {
  getCart: async () => {
    return await api.get('/cart');
  },

  addItem: async (variantId, quantity = 1) => {
    return await api.post('/cart/items', { variantId, quantity });
  },

  updateItemQuantity: async (cartItemId, quantity) => {
    return await api.put(`/cart/items/${cartItemId}`, { quantity });
  },

  removeItem: async (cartItemId) => {
    return await api.delete(`/cart/items/${cartItemId}`);
  },

  clearCart: async () => {
    return await api.delete('/cart');
  }
};
