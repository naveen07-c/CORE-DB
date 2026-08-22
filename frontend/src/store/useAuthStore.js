import { create } from 'zustand';
import { authService } from '../services/authService';

export const useAuthStore = create((set, get) => {
  // Initialize from localStorage if present
  let initialUser = null;
  let initialToken = localStorage.getItem('vortex_token') || null;
  try {
    const storedUser = localStorage.getItem('vortex_user');
    if (storedUser) initialUser = JSON.parse(storedUser);
  } catch (e) {
    console.error('Failed to parse cached user:', e);
  }

  return {
    user: initialUser,
    token: initialToken,
    isAuthenticated: !!initialToken,
    isLoading: false,
    addresses: [],
    loadingAddresses: false,
    error: null,

    login: async (credentials) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authService.login(credentials);
        const { user, token } = response.data || response;
        localStorage.setItem('vortex_token', token);
        localStorage.setItem('vortex_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true, isLoading: false });
        // Fetch addresses for the user
        get().fetchAddresses();
        return { success: true, user };
      } catch (err) {
        set({ error: err.message || 'Login failed', isLoading: false });
        throw err;
      }
    },

    register: async (userData) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authService.register(userData);
        const { user, token } = response.data || response;
        localStorage.setItem('vortex_token', token);
        localStorage.setItem('vortex_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true, isLoading: false });
        return { success: true, user };
      } catch (err) {
        set({ error: err.message || 'Registration failed', isLoading: false });
        throw err;
      }
    },

    logout: () => {
      localStorage.removeItem('vortex_token');
      localStorage.removeItem('vortex_user');
      set({ user: null, token: null, isAuthenticated: false, addresses: [] });
    },

    fetchAddresses: async () => {
      if (!get().isAuthenticated) return;
      set({ loadingAddresses: true });
      try {
        const response = await authService.getAddresses();
        const addresses = response.data || response || [];
        set({ addresses, loadingAddresses: false });
      } catch (err) {
        console.error('Error loading addresses:', err);
        set({ loadingAddresses: false });
      }
    },

    addAddress: async (addressData) => {
      try {
        await authService.createAddress(addressData);
        await get().fetchAddresses();
        return { success: true };
      } catch (err) {
        throw err;
      }
    },

    removeAddress: async (addressId) => {
      try {
        await authService.deleteAddress(addressId);
        set((state) => ({
          addresses: state.addresses.filter((a) => a.addressId !== addressId && a.address_id !== addressId),
        }));
      } catch (err) {
        throw err;
      }
    }
  };
});
