import { pool } from '../../config/database';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { ICartRepository } from '../interfaces';
import { Cart, CartResponse } from '../../types';

interface CartRow extends RowDataPacket {
  cart_id: number;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

interface ItemRow extends RowDataPacket {
  cart_item_id: number;
  variant_id: number;
  quantity: number;
  sku: string;
  color: string | null;
  size: string | null;
  storage: string | null;
  unit_price: number;
  stock_quantity: number;
  product_id: number | null;
  product_name: string | null;
}

export class MySqlCartRepository implements ICartRepository {
  async getOrCreateCart(userId: number): Promise<Cart> {
    const [rows] = await pool.query<CartRow[]>(
      'SELECT * FROM cart WHERE user_id = ?',
      [userId]
    );
    if (rows.length > 0) {
      const c = rows[0];
      return {
        cartId: c.cart_id,
        userId: c.user_id,
        createdAt: new Date(c.created_at),
        updatedAt: new Date(c.updated_at),
      };
    }

    // Handle race with UNIQUE(user_id) by retrying select on duplicate error
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO cart (user_id) VALUES (?)',
        [userId]
      );
      return (await this.getCartById(result.insertId))!;
    } catch (err: any) {
      if (err && err.code === 'ER_DUP_ENTRY') {
        const [retry] = await pool.query<CartRow[]>('SELECT * FROM cart WHERE user_id = ?', [userId]);
        const c = retry[0];
        return {
          cartId: c.cart_id,
          userId: c.user_id,
          createdAt: new Date(c.created_at),
          updatedAt: new Date(c.updated_at),
        };
      }
      throw err;
    }
  }

  private async getCartById(cartId: number): Promise<Cart | null> {
    const [rows] = await pool.query<CartRow[]>('SELECT * FROM cart WHERE cart_id = ?', [cartId]);
    if (rows.length === 0) return null;
    const c = rows[0];
    return {
      cartId: c.cart_id,
      userId: c.user_id,
      createdAt: new Date(c.created_at),
      updatedAt: new Date(c.updated_at),
    };
  }

  async getCartByUserId(userId: number): Promise<CartResponse> {
    const cart = await this.getOrCreateCart(userId);

    const [rows] = await pool.query<ItemRow[]>(
      `SELECT ci.cart_item_id, ci.variant_id, ci.quantity,
              v.sku, v.color, v.size, v.storage, v.price AS unit_price, v.stock_quantity,
              p.product_id, p.name AS product_name
       FROM cart_items ci
       JOIN product_variants v ON v.variant_id = ci.variant_id
       LEFT JOIN products p ON p.product_id = v.product_id
       WHERE ci.cart_id = ?
       ORDER BY ci.cart_item_id`,
      [cart.cartId]
    );

    const detailedItems = rows.map((r) => {
      const variantDetails =
        [r.color, r.size, r.storage].filter(Boolean).join(' / ') || 'Standard';
      const unitPrice = Number(r.unit_price);
      return {
        cartItemId: r.cart_item_id,
        variantId: r.variant_id,
        productId: r.product_id || 0,
        productName: r.product_name || 'Unknown Product',
        sku: r.sku,
        variantDetails,
        unitPrice,
        quantity: r.quantity,
        stockAvailable: r.stock_quantity,
        totalPrice: Number((unitPrice * r.quantity).toFixed(2)),
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

    const [variantRows] = await pool.query<RowDataPacket[]>(
      'SELECT stock_quantity, is_active FROM product_variants WHERE variant_id = ?',
      [variantId]
    );
    const variant = variantRows[0];
    if (!variant || !variant.is_active) {
      throw new Error('Product variant not found or inactive.');
    }

    const [existingRows] = await pool.query<RowDataPacket[]>(
      'SELECT cart_item_id, quantity FROM cart_items WHERE cart_id = ? AND variant_id = ?',
      [cart.cartId, variantId]
    );

    const stockQuantity = Number(variant.stock_quantity);

    if (existingRows.length > 0) {
      const existing = existingRows[0];
      const newQty = existing.quantity + quantity;
      if (newQty > stockQuantity) {
        throw new Error(
          `Requested quantity exceeds available warehouse stock (${stockQuantity} available).`
        );
      }
      await pool.execute('UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?', [
        newQty,
        existing.cart_item_id,
      ]);
    } else {
      if (quantity > stockQuantity) {
        throw new Error(
          `Requested quantity exceeds available warehouse stock (${stockQuantity} available).`
        );
      }
      await pool.execute(
        'INSERT INTO cart_items (cart_id, variant_id, quantity) VALUES (?, ?, ?)',
        [cart.cartId, variantId, quantity]
      );
    }
  }

  async updateItemQuantity(userId: number, cartItemId: number, quantity: number): Promise<void> {
    const cart = await this.getOrCreateCart(userId);

    const [itemRows] = await pool.query<RowDataPacket[]>(
      `SELECT ci.cart_item_id, ci.variant_id
       FROM cart_items ci
       WHERE ci.cart_item_id = ? AND ci.cart_id = ?`,
      [cartItemId, cart.cartId]
    );
    const item = itemRows[0];
    if (!item) {
      throw new Error('Cart item not found.');
    }

    if (quantity <= 0) {
      await this.removeItem(userId, cartItemId);
      return;
    }

    const [variantRows] = await pool.query<RowDataPacket[]>(
      'SELECT stock_quantity FROM product_variants WHERE variant_id = ?',
      [item.variant_id]
    );
    if (variantRows.length === 0) {
      throw new Error('Variant not found.');
    }

    const stockQuantity = Number(variantRows[0].stock_quantity);
    if (quantity > stockQuantity) {
      throw new Error(
        `Cannot set quantity to ${quantity}. Only ${stockQuantity} units available in inventory.`
      );
    }

    await pool.execute('UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?', [
      quantity,
      cartItemId,
    ]);
  }

  async removeItem(userId: number, cartItemId: number): Promise<void> {
    const cart = await this.getOrCreateCart(userId);
    await pool.execute('DELETE FROM cart_items WHERE cart_item_id = ? AND cart_id = ?', [
      cartItemId,
      cart.cartId,
    ]);
  }

  async clearCart(userId: number): Promise<void> {
    const cart = await this.getOrCreateCart(userId);
    await pool.execute('DELETE FROM cart_items WHERE cart_id = ?', [cart.cartId]);
  }
}
