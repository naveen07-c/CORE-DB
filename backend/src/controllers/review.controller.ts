import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { reviewService } from '../services/review.service';

export class ReviewController {
  async addReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = parseInt(String(req.params.productId), 10);
      const { rating, reviewText } = req.body;
      const review = await reviewService.addReview(req.user!.userId, productId, {
        rating: parseInt(String(rating), 10),
        reviewText,
      });
      res.status(201).json({
        success: true,
        message: 'Review submitted successfully.',
        data: review,
      });
    } catch (err) {
      next(err);
    }
  }

  async getProductReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = parseInt(String(req.params.productId), 10);
      const reviews = await reviewService.getProductReviews(productId);
      res.status(200).json({
        success: true,
        data: reviews,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const reviewController = new ReviewController();