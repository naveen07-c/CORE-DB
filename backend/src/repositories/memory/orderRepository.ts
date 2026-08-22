import { IOrderRepository } from '../interfaces';
import { Order, OrderItem, Payment, CheckoutResult } from '../../types';
import { memoryStorage } from './memoryStorage';

export class MemoryOrderRepository implements IOrderRepository {
  async executeCheckout(
    userId: number,
    addressId: number,
    paymentMethod: string,
    transactionId: string
  ): Promise<CheckoutResult> {
    // 1. Identify User Cart
    const cart = memoryStorage.carts.find((c) => c.userId === userId);
    if (!cart) {
      return {
        orderId: 0,
        transactionId: '',
        statusCode: 'ERR_CART_EMPTY',
        message: 'No active cart found for this user.',
      };
    }

    // 2. Check if Cart has items
    const userCartItems = memoryStorage.cartItems.filter((ci) => ci.cartId === cart.cartId);
    if (userCartItems.length === 0) {
      return {
        orderId: 0,
        transactionId: '',
        statusCode: 'ERR_CART_EMPTY',
        message: 'Shopping cart is empty.',
      };
    }

    // 3. Lock Variant Rows & Validate Stock Availability (ACID Check)
    for (const item of userCartItems) {
      const variant = memoryStorage.productVariants.find((v) => v.variantId === item.variantId);
      if (!variant || variant.stockQuantity < item.quantity) {
        return {
          orderId: 0,
          transactionId: '',
          statusCode: 'ERR_STOCK_DEPLETED',
          message: `One or more items in your cart (${variant?.sku || 'Item'}) exceeds available inventory.`,
        };
      }
    }

    // 4. Calculate Subtotal from Current Variant Pricing
    let subtotal = 0;
    for (const item of userCartItems) {
      const variant = memoryStorage.productVariants.find((v) => v.variantId === item.variantId)!;
      subtotal += variant.price * item.quantity;
    }

    const tax = Number((subtotal * 0.18).toFixed(2)); // 18% Standard GST
    const shipping = subtotal > 1000.00 ? 0.00 : 50.00; // Free shipping above 1000
    const total = Number((subtotal + tax + shipping).toFixed(2));

    const now = new Date();
    const orderId = memoryStorage.getNextOrderId();

    // 5. Create Order Header
    const newOrder: Order = {
      orderId,
      userId,
      addressId,
      orderStatus: 'PROCESSING',
      subtotalAmount: subtotal,
      taxAmount: tax,
      shippingFee: shipping,
      totalAmount: total,
      orderDate: now,
      updatedAt: now,
    };
    memoryStorage.orders.push(newOrder);

    // 6. Insert Order Items (Snapshotting Current Product Title & Price)
    for (const item of userCartItems) {
      const variant = memoryStorage.productVariants.find((v) => v.variantId === item.variantId)!;
      const product = memoryStorage.products.find((p) => p.productId === variant.productId)!;
      const variantDetails = [variant.color, variant.size, variant.storage].filter(Boolean).join(' / ') || 'Standard';

      const orderItem: OrderItem = {
        orderItemId: memoryStorage.getNextOrderItemId(),
        orderId,
        variantId: variant.variantId,
        productName: product.name,            // Immutable snapshot of product title
        variantDetails,                       // Immutable snapshot of variant specifications
        unitPrice: variant.price,             // Snapshot purchase price
        quantity: item.quantity,
        discount: 0.00,
        totalPrice: Number((variant.price * item.quantity).toFixed(2)),
      };
      memoryStorage.orderItems.push(orderItem);

      // 7. Deduct Inventory
      variant.stockQuantity -= item.quantity;
    }

    // 8. Create Payment Record (1:1 with Order)
    const validPaymentMethod = ['CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'COD'].includes(paymentMethod)
      ? (paymentMethod as any)
      : 'CREDIT_CARD';

    const newPayment: Payment = {
      paymentId: memoryStorage.getNextPaymentId(),
      orderId,
      paymentMethod: validPaymentMethod,
      amount: total,
      paymentStatus: 'SUCCESS',
      transactionId: transactionId || `TXN_${orderId}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      paymentDate: now,
    };
    memoryStorage.payments.push(newPayment);

    // 9. Purge Cart Items
    memoryStorage.cartItems = memoryStorage.cartItems.filter((ci) => ci.cartId !== cart.cartId);

    return {
      orderId,
      transactionId: newPayment.transactionId,
      statusCode: 'SUCCESS',
      message: 'Order placed and settled successfully.',
    };
  }

  async getOrdersByUserId(userId: number): Promise<any[]> {
    const userOrders = memoryStorage.orders
      .filter((o) => o.userId === userId)
      .sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());

    return userOrders.map((order) => {
      const items = memoryStorage.orderItems.filter((oi) => oi.orderId === order.orderId);
      const payment = memoryStorage.payments.find((p) => p.orderId === order.orderId);
      const address = memoryStorage.addresses.find((a) => a.addressId === order.addressId);

      return {
        orderId: order.orderId,
        orderDate: order.orderDate,
        orderStatus: order.orderStatus,
        subtotalAmount: order.subtotalAmount,
        taxAmount: order.taxAmount,
        shippingFee: order.shippingFee,
        totalAmount: order.totalAmount,
        itemCount: items.reduce((sum, it) => sum + it.quantity, 0),
        items,
        paymentStatus: payment?.paymentStatus || 'SUCCESS',
        paymentMethod: payment?.paymentMethod || 'CREDIT_CARD',
        transactionId: payment?.transactionId,
        address,
      };
    });
  }

  async getOrderById(orderId: number, userId?: number): Promise<any | null> {
    const order = memoryStorage.orders.find(
      (o) => o.orderId === orderId && (userId ? o.userId === userId : true)
    );
    if (!order) return null;

    const items = memoryStorage.orderItems.filter((oi) => oi.orderId === order.orderId);
    const payment = memoryStorage.payments.find((p) => p.orderId === order.orderId);
    const address = memoryStorage.addresses.find((a) => a.addressId === order.addressId);
    const user = memoryStorage.users.find((u) => u.userId === order.userId);

    return {
      orderId: order.orderId,
      orderDate: order.orderDate,
      orderStatus: order.orderStatus,
      subtotalAmount: order.subtotalAmount,
      taxAmount: order.taxAmount,
      shippingFee: order.shippingFee,
      totalAmount: order.totalAmount,
      items,
      payment: payment ? { ...payment } : null,
      address: address ? { ...address } : null,
      customer: user ? { userId: user.userId, fullName: user.fullName, email: user.email } : null,
    };
  }
}
