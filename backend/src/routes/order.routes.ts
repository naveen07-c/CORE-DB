import { Router } from 'express';
import { z } from 'zod';
import { orderController } from '../controllers/order.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate';

const router = Router();

const checkoutSchema = z.object({
  addressId: z.number().int().positive(),
  paymentMethod: z.enum(['UPI', 'CARD', 'NET_BANKING', 'COD']),
});

router.post('/checkout', requireAuth, validateBody(checkoutSchema), (req, res, next) =>
  orderController.checkout(req as any, res, next)
);
router.get('/orders', requireAuth, (req, res, next) => orderController.getOrders(req as any, res, next));
router.get('/orders/:orderId', requireAuth, (req, res, next) => orderController.getOrderById(req as any, res, next));

export default router;