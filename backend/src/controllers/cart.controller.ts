import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { cartService } from '../services/cart.service';

export class CartController {
  async getCart(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const cart = await cartService.getCart(req.user!.userId);
      res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (err) {
      next(err);
    }
  }

  async addItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { variantId, quantity } = req.body;
      await cartService.addItem(req.user!.userId, parseInt(String(variantId), 10), parseInt(String(quantity || '1'), 10));
      res.status(200).json({
        success: true,
        message: 'Cart updated successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  async updateQuantity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const cartItemId = parseInt(String(req.params.cartItemId), 10);
      const { quantity } = req.body;
      await cartService.updateQuantity(req.user!.userId, cartItemId, parseInt(String(quantity), 10));
      res.status(200).json({
        success: true,
        message: 'Item quantity updated.',
      });
    } catch (err) {
      next(err);
    }
  }

  async removeItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const cartItemId = parseInt(String(req.params.cartItemId), 10);
      await cartService.removeItem(req.user!.userId, cartItemId);
      res.status(200).json({
        success: true,
        message: 'Item removed from cart.',
      });
    } catch (err) {
      next(err);
    }
  }

  async clearCart(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await cartService.clearCart(req.user!.userId);
      res.status(200).json({
        success: true,
        message: 'Cart cleared.',
      });
    } catch (err) {
      next(err);
    }
  }
}

export const cartController = new CartController();
