import { pool } from '../../config/database';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IReviewRepository } from '../interfaces';
import { Review } from '../../types';

interface ReviewRow extends RowDataPacket {
  review_id: number;
  user_id: number;
  product_id: number;
  rating: number;
  review_text: string | null;
  review_date: Date;
  user_name?: string | null;
}

export class MySqlReviewRepository implements IReviewRepository {
  async createReview(reviewData: Omit<Review, 'reviewId' | 'reviewDate'>): Promise<Review> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO reviews (user_id, product_id, rating, review_text)
         VALUES (?, ?, ?, ?)`,
        [reviewData.userId, reviewData.productId, reviewData.rating, reviewData.reviewText ?? null]
      );
      const [rows] = await pool.query<ReviewRow[]>(
        'SELECT * FROM reviews WHERE review_id = ?',
        [result.insertId]
      );
      const r = rows[0];
      return {
        reviewId: r.review_id,
        userId: r.user_id,
        productId: r.product_id,
        rating: r.rating,
        reviewText: r.review_text,
        reviewDate: new Date(r.review_date),
      };
    } catch (err: any) {
      if (err && err.code === 'ER_DUP_ENTRY') {
        throw new Error('DUPLICATE_ENTRY: You have already submitted a review for this product.');
      }
      throw err;
    }
  }

  async hasUserPurchasedProduct(userId: number, productId: number): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 1 AS purchased
       FROM order_items oi
       JOIN orders o ON o.order_id = oi.order_id
       JOIN product_variants v ON v.variant_id = oi.variant_id
       WHERE o.user_id = ? AND o.order_status <> 'CANCELLED' AND v.product_id = ?
       LIMIT 1`,
      [userId, productId]
    );
    return rows.length > 0;
  }

  async getReviewsByProductId(productId: number): Promise<Array<Review & { userName: string }>> {
    const [rows] = await pool.query<ReviewRow[]>(
      `SELECT r.review_id, r.user_id, r.product_id, r.rating, r.review_text, r.review_date,
              u.full_name AS user_name
       FROM reviews r
       LEFT JOIN users u ON u.user_id = r.user_id
       WHERE r.product_id = ?
       ORDER BY r.review_date DESC`,
      [productId]
    );
    return rows.map((r) => ({
      reviewId: r.review_id,
      userId: r.user_id,
      productId: r.product_id,
      rating: r.rating,
      reviewText: r.review_text,
      reviewDate: new Date(r.review_date),
      userName: r.user_name || 'Verified Customer',
    }));
  }
}
