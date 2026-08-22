import { IReviewRepository } from '../interfaces';
import { Review } from '../../types';
import { memoryStorage } from './memoryStorage';

export class MemoryReviewRepository implements IReviewRepository {
  async createReview(reviewData: Omit<Review, 'reviewId' | 'reviewDate'>): Promise<Review> {
    // Unique Key constraint: uq_user_product_review (user_id, product_id)
    const existing = memoryStorage.reviews.find(
      (r) => r.userId === reviewData.userId && r.productId === reviewData.productId
    );
    if (existing) {
      throw new Error('DUPLICATE_ENTRY: You have already submitted a review for this product.');
    }

    const newReview: Review = {
      reviewId: memoryStorage.getNextReviewId(),
      ...reviewData,
      reviewDate: new Date(),
    };
    memoryStorage.reviews.push(newReview);
    return { ...newReview };
  }

  async hasUserPurchasedProduct(userId: number, productId: number): Promise<boolean> {
    // Find all variants for this product
    const productVariantIds = memoryStorage.productVariants
      .filter((v) => v.productId === productId)
      .map((v) => v.variantId);

    // Find all completed orders placed by this user
    const userOrderIds = memoryStorage.orders
      .filter((o) => o.userId === userId && o.orderStatus !== 'CANCELLED')
      .map((o) => o.orderId);

    // Check if any order items match
    return memoryStorage.orderItems.some(
      (oi) => userOrderIds.includes(oi.orderId) && productVariantIds.includes(oi.variantId)
    );
  }

  async getReviewsByProductId(productId: number): Promise<Array<Review & { userName: string }>> {
    return memoryStorage.reviews
      .filter((r) => r.productId === productId)
      .sort((a, b) => b.reviewDate.getTime() - a.reviewDate.getTime())
      .map((r) => {
        const user = memoryStorage.users.find((u) => u.userId === r.userId);
        return {
          ...r,
          userName: user?.fullName || 'Verified Customer',
        };
      });
  }
}
