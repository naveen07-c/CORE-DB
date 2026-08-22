import { create } from 'zustand';
import { cartService } from '../services/cartService';
import { useAuthStore } from './useAuthStore';

export const useCartStore = create((set, get) => ({
  cartId: null,
  items: [],
  itemCount: 0,
  subtotal: 0,
  isDrawerOpen: false,
  isLoading: false,
  error: null,

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

  fetchCart: async () => {
    const isAuth = useAuthStore.getState().isAuthenticated;
    if (!isAuth) {
      set({ items: [], itemCount: 0, subtotal: 0, cartId: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await cartService.getCart();
      const cartData = response.data || response;
      const items = cartData.items || [];
      const count = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
      const subtotal = items.reduce((acc, item) => acc + (item.totalPrice || item.unitPrice * item.quantity || 0), 0);

      set({
        cartId: cartData.cartId || cartData.cart_id,
        items,
        itemCount: count,
        subtotal,
        isLoading: false,
      });
    } catch (err) {
      console.error('Error fetching cart:', err);
      set({ isLoading: false, error: err.message });
    }
  },

  addItem: async (variantId, quantity = 1) => {
    const isAuth = useAuthStore.getState().isAuthenticated;
    if (!isAuth) {
      throw new Error('Please sign in to add items to your cart.');
    }

    set({ isLoading: true, error: null });
    try {
      await cartService.addItem(variantId, quantity);
      await get().fetchCart();
      set({ isDrawerOpen: true }); // auto open cart drawer on addition
      return { success: true };
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  updateQuantity: async (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      return get().removeItem(cartItemId);
    }

    // Optimistic update
    const previousItems = get().items;
    const updatedItems = previousItems.map((item) => {
      if (item.cartItemId === cartItemId || item.cart_item_id === cartItemId) {
        const unitPrice = item.unitPrice || item.unit_price || 0;
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: unitPrice * newQuantity,
        };
      }
      return item;
    });

    const newCount = updatedItems.reduce((acc, it) => acc + it.quantity, 0);
    const newSubtotal = updatedItems.reduce((acc, it) => acc + (it.totalPrice || 0), 0);

    set({ items: updatedItems, itemCount: newCount, subtotal: newSubtotal });

    try {
      await cartService.updateItemQuantity(cartItemId, newQuantity);
      await get().fetchCart(); // reconcile with backend
    } catch (err) {
      // rollback on error
      set({ items: previousItems });
      await get().fetchCart();
      throw err;
    }
  },

  removeItem: async (cartItemId) => {
    const previousItems = get().items;
    set((state) => {
      const remaining = state.items.filter((it) => it.cartItemId !== cartItemId && it.cart_item_id !== cartItemId);
      const newCount = remaining.reduce((acc, it) => acc + it.quantity, 0);
      const newSubtotal = remaining.reduce((acc, it) => acc + (it.totalPrice || 0), 0);
      return { items: remaining, itemCount: newCount, subtotal: newSubtotal };
    });

    try {
      await cartService.removeItem(cartItemId);
      await get().fetchCart();
    } catch (err) {
      set({ items: previousItems });
      await get().fetchCart();
      throw err;
    }
  },

  clearCartState: () => {
    set({ cartId: null, items: [], itemCount: 0, subtotal: 0 });
  }
}));
