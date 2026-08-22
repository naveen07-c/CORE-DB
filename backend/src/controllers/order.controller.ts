import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { checkoutService } from '../services/checkout.service';

export class OrderController {
  async checkout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { addressId, paymentMethod } = req.body;
      const result = await checkoutService.checkout(
        req.user!.userId,
        parseInt(String(addressId), 10),
        paymentMethod
      );
      res.status(201).json({
        success: true,
        orderId: result.orderId,
        transactionId: result.transactionId,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  }

  async getOrders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await checkoutService.getOrders(req.user!.userId);
      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (err) {
      next(err);
    }
  }

  async getOrderById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderId = parseInt(String(req.params.orderId), 10);
      const order = await checkoutService.getOrderById(
        orderId,
        req.user?.role === 'ADMIN' ? undefined : req.user!.userId
      );
      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const orderController = new OrderController();
