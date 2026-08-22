import { ICartRepository } from '../interfaces';
import { Cart, CartResponse } from '../../types';
import { memoryStorage } from './memoryStorage';

export class MemoryCartRepository implements ICartRepository {
  async getOrCreateCart(userId: number): Promise<Cart> {
    let cart = memoryStorage.carts.find((c) => c.userId === userId);
    if (!cart) {
      const now = new Date();
      cart = {
        cartId: memoryStorage.getNextCartId(),
        userId,
        createdAt: now,
        updatedAt: now,
      };
      memoryStorage.carts.push(cart);
    }
    return { ...cart };
  }

  async getCartByUserId(userId: number): Promise<CartResponse> {
    const cart = await this.getOrCreateCart(userId);
    const items = memoryStorage.cartItems.filter((ci) => ci.cartId === cart.cartId);

    const detailedItems = items.map((ci) => {
      const variant = memoryStorage.productVariants.find((v) => v.variantId === ci.variantId);
      const product = variant ? memoryStorage.products.find((p) => p.productId === variant.productId) : null;

      const variantDetails = [variant?.color, variant?.size, variant?.storage].filter(Boolean).join(' / ') || 'Standard';
      const unitPrice = variant ? variant.price : 0;
      const totalPrice = unitPrice * ci.quantity;

      return {
        cartItemId: ci.cartItemId,
        variantId: ci.variantId,
        productId: product?.productId || 0,
        productName: product?.name || 'Unknown Product',
        sku: variant?.sku || '',
        variantDetails,
        unitPrice,
        quantity: ci.quantity,
        stockAvailable: variant?.stockQuantity || 0,
        totalPrice,
        imageUrl: variant?.imageUrl || null,
      };
    });

    const itemCount = detailedItems.reduce((sum, it) => sum + it.quantity, 0);
    const subtotal = detailedItems.reduce((sum, it) => sum + it.totalPrice, 0);

    return {
      cartId: cart.cartId,
      itemCount,
      subtotal: Number(subtotal.toFixed(2)),
      items: detailedItems,
    };
  }

  async addItem(userId: number, variantId: number, quantity: number): Promise<void> {
    const cart = await this.getOrCreateCart(userId);
    const variant = memoryStorage.productVariants.find((v) => v.variantId === variantId && v.isActive);
    if (!variant) {
      throw new Error('Product variant not found or inactive.');
    }

    // Composite UNIQUE KEY uq_cart_variant (cart_id, variant_id)
    const existing = memoryStorage.cartItems.find(
      (ci) => ci.cartId === cart.cartId && ci.variantId === variantId
    );

    if (existing) {
      // ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
      const newQty = existing.quantity + quantity;
      if (newQty > variant.stockQuantity) {
        throw new Error(`Requested quantity exceeds available warehouse stock (${variant.stockQuantity} available).`);
      }
      existing.quantity = newQty;
      existing.updatedAt = new Date();
    } else {
      if (quantity > variant.stockQuantity) {
        throw new Error(`Requested quantity exceeds available warehouse stock (${variant.stockQuantity} available).`);
      }
      const now = new Date();
      memoryStorage.cartItems.push({
        cartItemId: memoryStorage.getNextCartItemId(),
        cartId: cart.cartId,
        variantId,
        quantity,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  async updateItemQuantity(userId: number, cartItemId: number, quantity: number): Promise<void> {
    const cart = await this.getOrCreateCart(userId);
    const item = memoryStorage.cartItems.find(
      (ci) => ci.cartItemId === cartItemId && ci.cartId === cart.cartId
    );
    if (!item) {
      throw new Error('Cart item not found.');
    }

    if (quantity <= 0) {
      await this.removeItem(userId, cartItemId);
      return;
    }

    const variant = memoryStorage.productVariants.find((v) => v.variantId === item.variantId);
    if (!variant) {
      throw new Error('Variant not found.');
    }

    if (quantity > variant.stockQuantity) {
      throw new Error(`Cannot set quantity to ${quantity}. Only ${variant.stockQuantity} units available in inventory.`);
    }

    item.quantity = quantity;
    item.updatedAt = new Date();
  }

  async removeItem(userId: number, cartItemId: number): Promise<void> {
    const cart = await this.getOrCreateCart(userId);
    const index = memoryStorage.cartItems.findIndex(
      (ci) => ci.cartItemId === cartItemId && ci.cartId === cart.cartId
    );
    if (index !== -1) {
      memoryStorage.cartItems.splice(index, 1);
    }
  }

  async clearCart(userId: number): Promise<void> {
    const cart = await this.getOrCreateCart(userId);
    memoryStorage.cartItems = memoryStorage.cartItems.filter((ci) => ci.cartId !== cart.cartId);
  }
}
