import { pool } from '../../config/database';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { ICatalogRepository, ProductFilterParams } from '../interfaces';
import { Category, Product, ProductDetailResponse, ProductVariant } from '../../types';

interface CategoryRow extends RowDataPacket {
  category_id: number;
  name: string;
  description: string | null;
  is_active: boolean | number;
  created_at: Date;
}

interface VariantRow extends RowDataPacket {
  variant_id: number;
  product_id: number;
  sku: string;
  color: string | null;
  size: string | null;
  storage: string | null;
  price: number;
  stock_quantity: number;
  is_active: boolean | number;
  created_at: Date;
}

interface ReviewRow extends RowDataPacket {
  review_id: number;
  user_id: number;
  product_id: number;
  rating: number;
  review_text: string | null;
  review_date: Date;
  user_name: string | null;
}

const mapCategory = (r: CategoryRow): Category => ({
  categoryId: r.category_id,
  name: r.name,
  description: r.description,
  isActive: Boolean(r.is_active),
  createdAt: new Date(r.created_at),
});

const mapVariant = (r: VariantRow): ProductVariant => ({
  variantId: r.variant_id,
  productId: r.product_id,
  sku: r.sku,
  color: r.color,
  size: r.size,
  storage: r.storage,
  price: Number(r.price),
  stockQuantity: r.stock_quantity,
  isActive: Boolean(r.is_active),
  createdAt: new Date(r.created_at),
});

export class MySqlCatalogRepository implements ICatalogRepository {
  async getCategories(): Promise<Category[]> {
    const [rows] = await pool.query<CategoryRow[]>(
      'SELECT * FROM categories WHERE is_active = TRUE ORDER BY category_id'
    );
    return rows.map(mapCategory);
  }

  async getProducts(
    filters: ProductFilterParams
  ): Promise<{ total: number; page: number; totalPages: number; data: any[] }> {
    const conditions: string[] = ['p.is_active = TRUE'];
    const params: unknown[] = [];

    if (filters.categoryId) {
      conditions.push('p.category_id = ?');
      params.push(filters.categoryId);
    }

    if (filters.brand) {
      conditions.push('LOWER(p.brand) = LOWER(?)');
      params.push(filters.brand);
    }

    if (filters.search) {
      conditions.push(`(
        p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?
        OR EXISTS (SELECT 1 FROM product_variants sv WHERE sv.product_id = p.product_id AND sv.sku LIKE ?)
      )`);
      const like = `%${filters.search}%`;
      params.push(like, like, like, like);
    }

    if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
      // Filter on effective min variant price, falling back to base price
      conditions.push(`COALESCE((
        SELECT MIN(v.price) FROM product_variants v
        WHERE v.product_id = p.product_id AND v.is_active = TRUE
      ), p.base_price) <= ?`);
      params.push(filters.maxPrice);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'p.product_id ASC';
    if (filters.sort === 'price_asc') orderBy = 'min_price ASC';
    else if (filters.sort === 'price_desc') orderBy = 'min_price DESC';
    else if (filters.sort === 'rating') orderBy = 'rating DESC';

    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const offset = (page - 1) * limit;

    const baseQuery = `
      FROM products p
      JOIN categories c ON c.category_id = p.category_id
      LEFT JOIN product_variants v ON v.product_id = p.product_id AND v.is_active = TRUE
      ${whereClause}
      GROUP BY p.product_id, c.name
    `;

    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM (
        SELECT p.product_id,
               COALESCE(MIN(v.price), p.base_price) AS min_price
        FROM products p
        LEFT JOIN product_variants v ON v.product_id = p.product_id AND v.is_active = TRUE
        ${whereClause}
        GROUP BY p.product_id, p.base_price
       ) AS t`,
      params
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         p.product_id AS productId,
         p.name,
         p.brand,
         p.description,
         p.base_price AS basePrice,
         p.category_id AS categoryId,
         c.name AS categoryName,
         COUNT(v.variant_id) AS variantCount,
         COALESCE(MIN(v.price), p.base_price) AS minPrice,
         COALESCE(MAX(v.price), p.base_price) AS maxPrice,
         COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.product_id), 5.0) AS rating,
         (SELECT COUNT(*) FROM reviews r2 WHERE r2.product_id = p.product_id) AS totalReviews
       ${baseQuery}
       ORDER BY ${orderBy}
       LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
      params
    );

    const total = Number(countRows[0].total);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      total,
      page,
      totalPages,
      data: rows.map((r: any) => ({
        productId: r.productId,
        name: r.name,
        brand: r.brand,
        description: r.description,
        basePrice: Number(r.basePrice),
        categoryId: r.categoryId,
        categoryName: r.categoryName || 'Electronics',
        variantCount: Number(r.variantCount),
        minPrice: Number(r.minPrice),
        maxPrice: Number(r.maxPrice),
        rating: Number(Number(r.rating).toFixed(1)),
        totalReviews: Number(r.totalReviews),
      })),
    };
  }

  async getProductById(productId: number): Promise<ProductDetailResponse | null> {
    const [productRows] = await pool.query<RowDataPacket[]>(
      `SELECT p.*, c.category_id AS cat_id, c.name AS cat_name
       FROM products p
       LEFT JOIN categories c ON c.category_id = p.category_id
       WHERE p.is_active = TRUE AND p.product_id = ?`,
      [productId]
    );
    if (productRows.length === 0) return null;

    const p = productRows[0];
    const product: Product = {
      productId: p.product_id,
      categoryId: p.category_id,
      name: p.name,
      description: p.description,
      brand: p.brand,
      basePrice: Number(p.base_price),
      isActive: Boolean(p.is_active),
      createdAt: new Date(p.created_at),
    };

    const [variantRows] = await pool.query<VariantRow[]>(
      'SELECT * FROM product_variants WHERE product_id = ? AND is_active = TRUE ORDER BY variant_id',
      [productId]
    );
    const variants = variantRows.map(mapVariant);

    const [reviewRows] = await pool.query<ReviewRow[]>(
      `SELECT r.review_id, r.user_id, r.product_id, r.rating, r.review_text, r.review_date, u.full_name AS user_name
       FROM reviews r
       LEFT JOIN users u ON u.user_id = r.user_id
       WHERE r.product_id = ?
       ORDER BY r.review_date DESC`,
      [productId]
    );
    const reviews = reviewRows.map((r) => ({
      reviewId: r.review_id,
      userId: r.user_id,
      productId: r.product_id,
      rating: r.rating,
      reviewText: r.review_text,
      reviewDate: new Date(r.review_date),
      userName: r.user_name || 'Verified Customer',
    }));

    const averageRating =
      reviews.length > 0 ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length : 5.0;

    return {
      ...product,
      category: {
        categoryId: p.cat_id ?? product.categoryId,
        name: p.cat_name || 'Electronics',
      },
      variants,
      reviews: {
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews: reviews.length,
        items: reviews,
      },
    };
  }

  async getVariantById(variantId: number): Promise<ProductVariant | null> {
    const [rows] = await pool.query<VariantRow[]>(
      'SELECT * FROM product_variants WHERE variant_id = ? AND is_active = TRUE',
      [variantId]
    );
    return rows.length > 0 ? mapVariant(rows[0]) : null;
  }

  async updateVariantPrice(variantId: number, newPrice: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE product_variants SET price = ? WHERE variant_id = ?',
      [newPrice, variantId]
    );
    return result.affectedRows > 0;
  }

  async updateVariantStock(variantId: number, newStock: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE product_variants SET stock_quantity = ? WHERE variant_id = ?',
      [newStock, variantId]
    );
    return result.affectedRows > 0;
  }
}
