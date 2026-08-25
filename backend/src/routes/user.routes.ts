import { Router } from 'express';
import { z } from 'zod';
import { userController } from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate';

const router = Router();

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(100),
  phone: z.string().min(5, 'Valid phone number required').max(20),
  addressLine1: z.string().min(3, 'Address line 1 is required').max(255),
  addressLine2: z.string().max(255).optional().nullable(),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  pincode: z.string().min(3, 'Pincode is required').max(20),
  addressType: z.enum(['HOME', 'OFFICE', 'OTHER']).optional(),
});

router.use(requireAuth);

router.get('/addresses', (req, res, next) => userController.getAddresses(req, res, next));
router.post('/addresses', validateBody(addressSchema), (req, res, next) => userController.createAddress(req, res, next));
router.delete('/addresses/:addressId', (req, res, next) => userController.deleteAddress(req, res, next));

export default router;