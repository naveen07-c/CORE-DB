/**
 * Comprehensive bootstrap: seeds categories, users (with bcrypt passwords),
 * addresses, products, product variants, carts, and reviews in correct relational order.
 *
 * Run from backend/:  npx tsx scripts/bootstrapMysql.ts
 */
import bcrypt from 'bcryptjs';
import { pool } from '../src/config/database';
import { memoryStorage } from '../src/repositories/memory/memoryStorage';

async function main() {
  console.log('🚀 Starting Aiven MySQL bootstrap and data sync...');

  // 1. Categories
  for (const c of memoryStorage.categories) {
    await pool.execute(
      `INSERT INTO categories (category_id, name, description, is_active)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)`,
      [c.categoryId, c.name, c.description ?? null, c.isActive ? 1 : 0]
    );
  }
  console.log(`✅ Synced ${memoryStorage.categories.length} categories.`);

  // 2. Users (with bcrypt hashed passwords for 'Pass123!')
  const passwordHash = bcrypt.hashSync('Pass123!', 10);
  for (const u of memoryStorage.users) {
    await pool.execute(
      `INSERT INTO users (user_id, full_name, email, password, phone, is_active)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE password = VALUES(password), full_name = VALUES(full_name)`,
      [u.userId, u.fullName, u.email, passwordHash, u.phone ?? null, u.isActive ? 1 : 0]
    );
  }
  console.log(`✅ Synced ${memoryStorage.users.length} users with bcrypt password ('Pass123!').`);

  // 3. Addresses
  for (const a of memoryStorage.addresses) {
    await pool.execute(
      `INSERT INTO addresses (address_id, user_id, full_name, phone, address_line1, address_line2, city, state, pincode, address_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE address_line1 = VALUES(address_line1)`,
      [
        a.addressId,
        a.userId,
        a.fullName,
        a.phone,
        a.addressLine1,
        a.addressLine2 ?? null,
        a.city,
        a.state,
        a.pincode,
        a.addressType || 'HOME',
      ]
    );
  }
  console.log(`✅ Synced ${memoryStorage.addresses.length} addresses.`);

  // 4. Products
  for (const p of memoryStorage.products) {
    await pool.execute(
      `INSERT INTO products (product_id, category_id, name, description, brand, base_price, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), base_price = VALUES(base_price)`,
      [p.productId, p.categoryId, p.name, p.description ?? null, p.brand ?? null, p.basePrice, p.isActive ? 1 : 0]
    );
  }
  console.log(`✅ Synced ${memoryStorage.products.length} products.`);

  // 5. Product Variants
  for (const v of memoryStorage.productVariants) {
    await pool.execute(
      `INSERT INTO product_variants (variant_id, product_id, sku, color, size, storage, price, stock_quantity, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE price = VALUES(price), stock_quantity = VALUES(stock_quantity)`,
      [
        v.variantId,
        v.productId,
        v.sku,
        v.color ?? null,
        v.size ?? null,
        v.storage ?? null,
        v.price,
        v.stockQuantity,
        v.isActive ? 1 : 0,
      ]
    );
  }
  console.log(`✅ Synced ${memoryStorage.productVariants.length} product variants.`);

  // 6. Ensure 1:1 Carts for every user
  await pool.execute(
    `INSERT INTO cart (user_id)
     SELECT u.user_id FROM users u
     LEFT JOIN cart c ON c.user_id = u.user_id
     WHERE c.cart_id IS NULL`
  );
  console.log(`✅ Ensured user carts.`);

  // 7. Reviews (if any)
  for (const r of memoryStorage.reviews) {
    await pool.execute(
      `INSERT INTO reviews (review_id, user_id, product_id, rating, review_text)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), review_text = VALUES(review_text)`,
      [r.reviewId, r.userId, r.productId, r.rating, r.reviewText ?? null]
    );
  }
  console.log(`✅ Synced reviews.`);

  // 8. Row counts summary
  const [counts] = await pool.query<any[]>(`
    SELECT
      (SELECT COUNT(*) FROM categories) AS categories,
      (SELECT COUNT(*) FROM users) AS users,
      (SELECT COUNT(*) FROM addresses) AS addresses,
      (SELECT COUNT(*) FROM products) AS products,
      (SELECT COUNT(*) FROM product_variants) AS variants,
      (SELECT COUNT(*) FROM cart) AS carts,
      (SELECT COUNT(*) FROM reviews) AS reviews,
      (SELECT COUNT(*) FROM orders) AS orders
  `);
  console.log('\n📊 Live Cloud Database Summary:');
  console.table(counts[0]);

  await pool.end();
}

main().catch((err) => {
  console.error('❌ Bootstrap failed:', err);
  process.exit(1);
});
