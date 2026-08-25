/**
 * One-time bootstrap: syncs the app's curated catalog + demo credentials
 * into the MySQL ecommerce_db created by database/ecommerce_db.sql.
 *
 * Run from backend/:  npx tsx scripts/bootstrapMysql.ts
 */
import bcrypt from 'bcryptjs';
import { pool } from '../src/config/database';
import { memoryStorage } from '../src/repositories/memory/memoryStorage';

async function main() {
  // 1. Demo login parity: ecommerce_db.sql ships plaintext passwords;
  //    the API compares against bcrypt hashes of 'Pass123!'.
  const hash = bcrypt.hashSync('Pass123!', 10);
  const [pwResult] = await pool.execute(
    `UPDATE users SET password = ? WHERE email IN ('rahul@example.com','priya@example.com','arjun@example.com')`,
    [hash]
  );
  console.log(`Updated ${(pwResult as any).affectedRows} demo user password(s) -> bcrypt('Pass123!')`);

  // 2. Catalog beyond the 5 products in ecommerce_db.sql.
  //    Memory seed IDs are contiguous, so explicit IDs align exactly with
  //    the rows already inserted by ecommerce_db.sql (products 1-5, variants 1-8).
  const existingProducts = await pool.query('SELECT MAX(product_id) AS maxId FROM products');
  const maxProductId = Number((existingProducts[0] as any)[0].maxId || 0);

  const existingVariants = await pool.query('SELECT MAX(variant_id) AS maxId FROM product_variants');
  const maxVariantId = Number((existingVariants[0] as any)[0].maxId || 0);

  const products = memoryStorage.products.filter((p) => p.productId > maxProductId);
  const variants = memoryStorage.productVariants.filter((v) => v.variantId > maxVariantId);

  for (const p of products) {
    await pool.execute(
      `INSERT INTO products (product_id, category_id, name, description, brand, base_price)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [p.productId, p.categoryId, p.name, p.description ?? null, p.brand ?? null, p.basePrice]
    );
  }
  console.log(`Inserted ${products.length} additional product(s).`);

  for (const v of variants) {
    await pool.execute(
      `INSERT INTO product_variants (variant_id, product_id, sku, color, size, storage, price, stock_quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [v.variantId, v.productId, v.sku, v.color ?? null, v.size ?? null, v.storage ?? null, v.price, v.stockQuantity]
    );
  }
  console.log(`Inserted ${variants.length} additional variant(s).`);

  // 3. Ensure every user has a cart row (1:1 relational rule)
  await pool.execute(
    `INSERT INTO cart (user_id)
     SELECT u.user_id FROM users u
     LEFT JOIN cart c ON c.user_id = u.user_id
     WHERE c.cart_id IS NULL`
  );

  // 4. Summary
  const [counts] = await pool.query<any[]>(`
    SELECT
      (SELECT COUNT(*) FROM users) AS users,
      (SELECT COUNT(*) FROM addresses) AS addresses,
      (SELECT COUNT(*) FROM categories) AS categories,
      (SELECT COUNT(*) FROM products) AS products,
      (SELECT COUNT(*) FROM product_variants) AS variants,
      (SELECT COUNT(*) FROM cart) AS carts,
      (SELECT COUNT(*) FROM cart_items) AS cart_items,
      (SELECT COUNT(*) FROM orders) AS orders,
      (SELECT COUNT(*) FROM payments) AS payments,
      (SELECT COUNT(*) FROM reviews) AS reviews
  `);
  console.log('ecommerce_db row counts:', counts[0]);

  await pool.end();
}

main().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
