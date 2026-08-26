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
    if (!productId) return false;
    return get().items.some(item => String(item.productId) === String(productId));
  },

  toggleWishlist: (product) => {
    if (!product || !product.productId) return;
    const current = get().items;
    const exists = current.some(item => String(item.productId) === String(product.productId));

    if (exists) {
      const updated = current.filter(item => String(item.productId) !== String(product.productId));
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
    if (!productId) return;
    const updated = get().items.filter(item => String(item.productId) !== String(productId));
    set({ items: updated });
    saveWishlist(updated);
    useToastStore.getState().info('Removed from wishlist');
  },

  clearWishlist: () => {
    set({ items: [] });
    saveWishlist([]);
  },
}));