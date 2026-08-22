import { Router } from 'express';
import { z } from 'zod';
import { catalogController } from '../controllers/catalog.controller';
import { reviewController } from '../controllers/review.controller';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate';

const router = Router();

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(150).optional().nullable(),
  reviewText: z.string().min(5, 'Review must be at least 5 characters'),
});

const priceUpdateSchema = z.object({
  price: z.number().nonnegative(),
});

const stockUpdateSchema = z.object({
  stock: z.number().int().nonnegative(),
});

// Categories & Products
router.get('/categories', (req, res, next) => catalogController.getCategories(req, res, next));
router.get('/products', (req, res, next) => catalogController.getProducts(req, res, next));
router.get('/products/:slugOrId', (req, res, next) => catalogController.getProductBySlugOrId(req, res, next));

// Reviews
router.get('/products/:productId/reviews', (req, res, next) => reviewController.getProductReviews(req, res, next));
router.post('/products/:productId/reviews', requireAuth, validateBody(reviewSchema), (req, res, next) =>
  reviewController.addReview(req as any, res, next)
);

// Admin testing endpoints for Section 5.2 validation
router.patch('/variants/:variantId/price', validateBody(priceUpdateSchema), (req, res, next) =>
  catalogController.updateVariantPrice(req, res, next)
);
router.patch('/variants/:variantId/stock', validateBody(stockUpdateSchema), (req, res, next) =>
  catalogController.updateVariantStock(req, res, next)
);

export default router;
