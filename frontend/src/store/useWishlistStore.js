import { create } from 'zustand';
import { useToastStore } from './useToastStore';

const WISHLIST_KEY = 'eshop_wishlist';

const getStoredWishlist = () => {
  try {
    const stored = localStorage.getItem(WISHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveWishlist = (items) => {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
};

export const useWishlistStore = create((set, get) => ({
  items: getStoredWishlist(),

  isInWishlist: (productId) => {
    return get().items.some(item => item.productId === productId);
  },

  toggleWishlist: (product) => {
    const current = get().items;
    const exists = current.some(item => item.productId === product.productId);

    if (exists) {
      const updated = current.filter(item => item.productId !== product.productId);
      set({ items: updated });
      saveWishlist(updated);
      useToastStore.getState().info('Removed from wishlist');
    } else {
      const updated = [...current, { ...product, addedAt: Date.now() }];
      set({ items: updated });
      saveWishlist(updated);
      useToastStore.getState().success('Added to wishlist!');
    }
  },

  removeFromWishlist: (productId) => {
    const updated = get().items.filter(item => item.productId !== productId);
    set({ items: updated });
    saveWishlist(updated);
    useToastStore.getState().info('Removed from wishlist');
  },

  clearWishlist: () => {
    set({ items: [] });
    saveWishlist([]);
  },
}));