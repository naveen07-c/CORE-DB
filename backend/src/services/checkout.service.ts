import { orderRepository, addressRepository } from '../repositories';
import { CheckoutResult } from '../types';

export class CheckoutService {
  async checkout(userId: number, addressId: number, paymentMethod: string): Promise<CheckoutResult> {
    // Validate address belongs to user
    const address = await addressRepository.findById(addressId);
    if (!address || address.userId !== userId) {
      const err: any = new Error('Invalid delivery address selected.');
      err.statusCode = 400;
      err.code = 'ERR_INVALID_ADDRESS';
      throw err;
    }

    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const result = await orderRepository.executeCheckout(userId, addressId, paymentMethod, transactionId);

    if (result.statusCode !== 'SUCCESS') {
      const err: any = new Error(result.message);
      err.statusCode = 400;
      err.code = result.statusCode;
      throw err;
    }

    return result;
  }

  async getOrders(userId: number): Promise<any[]> {
    return orderRepository.getOrdersByUserId(userId);
  }

  async getOrderById(orderId: number, userId?: number): Promise<any> {
    const order = await orderRepository.getOrderById(orderId, userId);
    if (!order) {
      const err: any = new Error('Order invoice not found.');
      err.statusCode = 404;
      err.code = 'ERR_ORDER_NOT_FOUND';
      throw err;
    }
    return order;
  }
}

export const checkoutService = new CheckoutService();
