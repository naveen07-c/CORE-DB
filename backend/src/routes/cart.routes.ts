import { Router } from 'express';
import { z } from 'zod';
import { cartController } from '../controllers/cart.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate';

const router = Router();

const addItemSchema = z.object({
  variantId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
});

const updateQuantitySchema = z.object({
  quantity: z.number().int().nonnegative(),
});

router.use(requireAuth);

router.get('/', (req, res, next) => cartController.getCart(req as any, res, next));
router.post('/items', validateBody(addItemSchema), (req, res, next) => cartController.addItem(req as any, res, next));
router.put('/items/:cartItemId', validateBody(updateQuantitySchema), (req, res, next) =>
  cartController.updateQuantity(req as any, res, next)
);
router.delete('/items/:cartItemId', (req, res, next) => cartController.removeItem(req as any, res, next));
router.delete('/', (req, res, next) => cartController.clearCart(req as any, res, next));

export default router;
