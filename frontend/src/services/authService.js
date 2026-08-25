import api from './api';

export const authService = {
  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  getProfile: async () => {
    return await api.get('/auth/me');
  },

  getAddresses: async () => {
    return await api.get('/user/addresses');
  },

  createAddress: async (addressData) => {
    return await api.post('/user/addresses', addressData);
  },

  deleteAddress: async (addressId) => {
    return await api.delete(`/user/addresses/${addressId}`);
  }
};