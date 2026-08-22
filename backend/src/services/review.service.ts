import { reviewRepository } from '../repositories';
import { Review } from '../types';

export class ReviewService {
  async addReview(
    userId: number,
    productId: number,
    data: { rating: number; title?: string; reviewText: string }
  ): Promise<Review> {
    const isVerified = await reviewRepository.hasUserPurchasedProduct(userId, productId);

    return reviewRepository.createReview({
      userId,
      productId,
      rating: data.rating,
      title: data.title || null,
      reviewText: data.reviewText,
      isVerified,
    });
  }

  async getProductReviews(productId: number): Promise<Array<Review & { userName: string }>> {
    return reviewRepository.getReviewsByProductId(productId);
  }
}

export const reviewService = new ReviewService();
