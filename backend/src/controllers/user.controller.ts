import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { addressService } from '../services/address.service';

export class UserController {
  async getAddresses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const addresses = await addressService.getAddresses(req.user!.userId);
      res.status(200).json({
        success: true,
        data: addresses,
      });
    } catch (err) {
      next(err);
    }
  }

  async createAddress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const address = await addressService.createAddress(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Address saved successfully.',
        addressId: address.addressId,
        data: address,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteAddress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const addressId = parseInt(String(req.params.addressId), 10);
      await addressService.deleteAddress(req.user!.userId, addressId);
      res.status(200).json({
        success: true,
        message: 'Address removed successfully.',
      });
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();