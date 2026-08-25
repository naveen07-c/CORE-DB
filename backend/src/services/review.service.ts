import { reviewRepository } from '../repositories';
import { Review } from '../types';

export class ReviewService {
  async addReview(
    userId: number,
    productId: number,
    data: { rating: number; reviewText: string }
  ): Promise<Review> {
    return reviewRepository.createReview({
      userId,
      productId,
      rating: data.rating,
      reviewText: data.reviewText,
    });
  }

  async getProductReviews(productId: number): Promise<Array<Review & { userName: string }>> {
    return reviewRepository.getReviewsByProductId(productId);
  }
}

export const reviewService = new ReviewService();