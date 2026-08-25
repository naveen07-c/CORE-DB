import { pool } from '../../config/database';
import type { RowDataPacket } from 'mysql2/promise';
import { IOrderRepository } from '../interfaces';
import { CheckoutResult } from '../../types';

interface CartItemRow extends RowDataPacket {
  variant_id: number;
  quantity: number;
}

interface LockedVariantRow extends RowDataPacket {
  variant_id: number;
  sku: string;
  price: number;
  stock_quantity: number;
  product_id: number;
  product_name: string;
}

interface OrderRow extends RowDataPacket {
  order_id: number;
  user_id: number;
  address_id: number;
  order_date: Date;
  order_status: string;
  total_amount: number;
}

interface OrderItemRow extends RowDataPacket {
  order_item_id: number;
  order_id: number;
  variant_id: number;
  product_name: string;
  price: number;
  quantity: number;
  discount: number;
  total_price: number;
}

interface PaymentRow extends RowDataPacket {
  payment_id: number;
  order_id: number;
  payment_method: string;
  amount: number;
  payment_status: string;
  transaction_id: string | null;
  payment_date: Date;
}

export class MySqlOrderRepository implements IOrderRepository {
  async executeCheckout(
    userId: number,
    addressId: number,
    paymentMethod: string,
    transactionId?: string
  ): Promise<CheckoutResult> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Identify User Cart
      const [cartRows] = await conn.query<RowDataPacket[]>(
        'SELECT cart_id FROM cart WHERE user_id = ? FOR UPDATE',
        [userId]
      );
      if (cartRows.length === 0) {
        await conn.rollback();
        return {
          orderId: 0,
          transactionId: '',
          statusCode: 'ERR_CART_EMPTY',
          message: 'No active cart found for this user.',
        };
      }
      const cartId = cartRows[0].cart_id;

      // 2. Check if Cart has items
      const [itemRows] = await conn.query<CartItemRow[]>(
        'SELECT variant_id, quantity FROM cart_items WHERE cart_id = ? ORDER BY cart_item_id',
        [cartId]
      );
      if (itemRows.length === 0) {
        await conn.rollback();
        return {
          orderId: 0,
          transactionId: '',
          statusCode: 'ERR_CART_EMPTY',
          message: 'Shopping cart is empty.',
        };
      }

      // 3. Lock Variant Rows & Validate Stock Availability (ACID Check)
      const variantIds = itemRows.map((i) => i.variant_id);
      const [variantRows] = await conn.query<LockedVariantRow[]>(
        `SELECT v.variant_id, v.sku, v.price, v.stock_quantity, v.product_id, p.name AS product_name
         FROM product_variants v
         JOIN products p ON p.product_id = v.product_id
         WHERE v.variant_id IN (${variantIds.map(() => '?').join(',')})
         FOR UPDATE`,
        variantIds
      );

      const variantMap = new Map<number, LockedVariantRow>();
      for (const v of variantRows) variantMap.set(v.variant_id, v);

      let subtotal = 0;
      for (const item of itemRows) {
        const variant = variantMap.get(item.variant_id);
        if (!variant || variant.stock_quantity < item.quantity) {
          await conn.rollback();
          return {
            orderId: 0,
            transactionId: '',
            statusCode: 'ERR_STOCK_DEPLETED',
            message: `One or more items in your cart (${variant?.sku || 'Item'}) exceeds available inventory.`,
          };
        }
        subtotal += Number(variant.price) * item.quantity;
      }

      const total = Number(subtotal.toFixed(2));

      // 4. Create Order Header
      const [orderResult] = await conn.execute<any>(
        `INSERT INTO orders (user_id, address_id, order_status, total_amount)
         VALUES (?, ?, 'CONFIRMED', ?)`,
        [userId, addressId, total]
      );
      const orderId = orderResult.insertId;

      // 5. Insert Order Items (Snapshotting Current Product Title & Price) + Deduct Inventory
      for (const item of itemRows) {
        const variant = variantMap.get(item.variant_id)!;
        await conn.execute(
          `INSERT INTO order_items (order_id, variant_id, product_name, price, quantity, discount, total_price)
           VALUES (?, ?, ?, ?, ?, 0.00, ?)`,
          [
            orderId,
            variant.variant_id,
            variant.product_name,
            variant.price,
            item.quantity,
            Number((Number(variant.price) * item.quantity).toFixed(2)),
          ]
        );
        await conn.execute(
          'UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE variant_id = ?',
          [item.quantity, variant.variant_id]
        );
      }

      // 6. Create Payment Record (1:1 with Order)
      const validPaymentMethod = ['UPI', 'CARD', 'NET_BANKING', 'COD'].includes(paymentMethod)
        ? paymentMethod
        : 'UPI';
      const finalTransactionId =
        transactionId ||
        `TXN_${orderId}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      await conn.execute(
        `INSERT INTO payments (order_id, payment_method, amount, payment_status, transaction_id)
         VALUES (?, ?, ?, 'SUCCESS', ?)`,
        [orderId, validPaymentMethod, total, finalTransactionId]
      );

      // 7. Purge Cart Items
      await conn.execute('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

      await conn.commit();

      return {
        orderId,
        transactionId: finalTransactionId,
        statusCode: 'SUCCESS',
        message: 'Order placed and settled successfully.',
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  async getOrdersByUserId(userId: number): Promise<any[]> {
    const [orderRows] = await pool.query<OrderRow[]>(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC',
      [userId]
    );
    if (orderRows.length === 0) return [];

    const results: any[] = [];
    for (const o of orderRows) {
      const [items] = await pool.query<OrderItemRow[]>(
        'SELECT * FROM order_items WHERE order_id = ? ORDER BY order_item_id',
        [o.order_id]
      );
      const [paymentRows] = await pool.query<PaymentRow[]>(
        'SELECT * FROM payments WHERE order_id = ?',
        [o.order_id]
      );
      const payment = paymentRows[0];
      const [addressRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM addresses WHERE address_id = ?',
        [o.address_id]
      );

      results.push({
        orderId: o.order_id,
        orderDate: new Date(o.order_date),
        orderStatus: o.order_status,
        totalAmount: Number(o.total_amount),
        itemCount: items.reduce((sum, it) => sum + it.quantity, 0),
        items: items.map(mapOrderItem),
        paymentStatus: payment?.payment_status || 'SUCCESS',
        paymentMethod: payment?.payment_method || 'UPI',
        transactionId: payment?.transaction_id,
        address: addressRows[0] ? mapAddress(addressRows[0]) : null,
      });
    }
    return results;
  }

  async getOrderById(orderId: number, userId?: number): Promise<any | null> {
    const conditions = userId
      ? 'o.order_id = ? AND o.user_id = ?'
      : 'o.order_id = ?';
    const params: unknown[] = userId ? [orderId, userId] : [orderId];

    const [orderRows] = await pool.query<OrderRow[]>(
      `SELECT o.* FROM orders o WHERE ${conditions}`,
      params
    );
    if (orderRows.length === 0) return null;

    const o = orderRows[0];

    const [items] = await pool.query<OrderItemRow[]>(
      'SELECT * FROM order_items WHERE order_id = ? ORDER BY order_item_id',
      [orderId]
    );
    const [paymentRows] = await pool.query<PaymentRow[]>(
      'SELECT * FROM payments WHERE order_id = ?',
      [orderId]
    );
    const [addressRows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM addresses WHERE address_id = ?',
      [o.address_id]
    );
    const [userRows] = await pool.query<RowDataPacket[]>(
      'SELECT user_id, full_name, email FROM users WHERE user_id = ?',
      [o.user_id]
    );

    const u: any = userRows[0];

    return {
      orderId: o.order_id,
      orderDate: new Date(o.order_date),
      orderStatus: o.order_status,
      totalAmount: Number(o.total_amount),
      items: items.map(mapOrderItem),
      payment: paymentRows[0] ? mapPayment(paymentRows[0]) : null,
      address: addressRows[0] ? mapAddress(addressRows[0]) : null,
      customer: u
        ? { userId: u.user_id, fullName: u.full_name, email: u.email }
        : null,
    };
  }
}

const mapOrderItem = (r: OrderItemRow) => ({
  orderItemId: r.order_item_id,
  orderId: r.order_id,
  variantId: r.variant_id,
  productName: r.product_name,
  price: Number(r.price),
  quantity: r.quantity,
  discount: Number(r.discount),
  totalPrice: Number(r.total_price),
});

const mapAddress = (r: any) => ({
  addressId: r.address_id,
  userId: r.user_id,
  fullName: r.full_name,
  phone: r.phone,
  addressLine1: r.address_line1,
  addressLine2: r.address_line2,
  city: r.city,
  state: r.state,
  pincode: r.pincode,
  addressType: r.address_type,
  createdAt: new Date(r.created_at),
});

const mapPayment = (r: PaymentRow) => ({
  paymentId: r.payment_id,
  orderId: r.order_id,
  paymentMethod: r.payment_method,
  amount: Number(r.amount),
  paymentStatus: r.payment_status,
  transactionId: r.transaction_id,
  paymentDate: new Date(r.payment_date),
});
