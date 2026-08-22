import { cartRepository } from '../repositories';
import { CartResponse } from '../types';

export class CartService {
  async getCart(userId: number): Promise<CartResponse> {
    return cartRepository.getCartByUserId(userId);
  }

  async addItem(userId: number, variantId: number, quantity: number): Promise<void> {
    return cartRepository.addItem(userId, variantId, quantity);
  }

  async updateQuantity(userId: number, cartItemId: number, quantity: number): Promise<void> {
    return cartRepository.updateItemQuantity(userId, cartItemId, quantity);
  }

  async removeItem(userId: number, cartItemId: number): Promise<void> {
    return cartRepository.removeItem(userId, cartItemId);
  }

  async clearCart(userId: number): Promise<void> {
    return cartRepository.clearCart(userId);
  }
}

export const cartService = new CartService();
