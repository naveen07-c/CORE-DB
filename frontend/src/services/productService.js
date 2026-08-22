import api from './api';

export const productService = {
  getCategories: async () => {
    return await api.get('/categories');
  },

  getProducts: async (params = {}) => {
    return await api.get('/products', { params });
  },

  getProductBySlugOrId: async (slugOrId) => {
    return await api.get(`/products/${slugOrId}`);
  },

  addReview: async (productId, reviewData) => {
    return await api.post(`/products/${productId}/reviews`, reviewData);
  }
};
