# SQL Queries — VORTEX Commerce (ecommerce_db)

Every SQL statement executed by the backend, mapped to each user step.
Source: `backend/src/repositories/mysql/*.ts` against `database/ecommerce_db.sql` (MySQL 8.0+).

---

## 0. Database & Schema Setup

```sql
-- database/ecommerce_db.sql
DROP DATABASE IF EXISTS ecommerce_db;
CREATE DATABASE ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecommerce_db;

CREATE TABLE users (...);            -- 11 tables total:
CREATE TABLE addresses (...);        -- users, addresses, categories, products,
CREATE TABLE categories (...);       -- product_variants, cart, cart_items, orders,
CREATE TABLE products (...);         -- order_items, payments, reviews
CREATE TABLE product_variants (...);
CREATE TABLE cart (...);
CREATE TABLE cart_items (...);
CREATE TABLE orders (...);
CREATE TABLE order_items (...);
CREATE TABLE payments (...);
CREATE TABLE reviews (...);
```

---

## 1. Authentication

### Step 1.1 — Register (`POST /api/auth/register`)
Check email uniqueness, insert user + create their 1:1 cart:

```sql
-- auth.service: userRepository.findByEmail()
SELECT * FROM users WHERE email = ? AND is_active = TRUE;

-- mysql/userRepository.create() — single transaction
START TRANSACTION;

INSERT INTO users (full_name, email, password, phone, is_active)
VALUES (?, ?, ?, ?, TRUE);          -- password stored as bcrypt hash

INSERT INTO cart (user_id) VALUES (?);   -- relational rule: every user gets a cart

COMMIT;

-- read back the created row
SELECT * FROM users WHERE user_id = ? AND is_active = TRUE;
```

### Step 1.2 — Login (`POST /api/auth/login`)
Fetch hash by email; bcrypt compare happens in Node:

```sql
SELECT * FROM users WHERE email = ? AND is_active = TRUE;
```

### Step 1.3 — View / Update / Delete Profile (`GET|PUT|DELETE /api/user/me`)

```sql
SELECT * FROM users WHERE user_id = ? AND is_active = TRUE;

UPDATE users SET full_name = ?, phone = ? WHERE user_id = ?;   -- dynamic SET clause

SELECT COUNT(*) AS cnt FROM orders WHERE user_id = ?;          -- RESTRICT check first
DELETE FROM users WHERE user_id = ?;                           -- ON DELETE CASCADE removes
                                                               -- addresses, cart, reviews
```

---

## 2. Catalog / Storefront

### Step 2.1 — Browse Categories (`GET /api/categories`)

```sql
SELECT * FROM categories WHERE is_active = TRUE ORDER BY category_id;
```

### Step 2.2 — Product Listing with Filters / Search / Sort / Pagination (`GET /api/products`)

Full aggregate query (category name, variant count, price range, avg rating):

```sql
SELECT
  p.product_id AS productId,
  p.name, p.brand, p.description,
  p.base_price AS basePrice,
  p.category_id AS categoryId,
  c.name AS categoryName,
  COUNT(v.variant_id) AS variantCount,
  COALESCE(MIN(v.price), p.base_price) AS minPrice,
  COALESCE(MAX(v.price), p.base_price) AS maxPrice,
  COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.product_id), 5.0) AS rating,
  (SELECT COUNT(*) FROM reviews r2 WHERE r2.product_id = p.product_id) AS totalReviews
FROM products p
JOIN categories c ON c.category_id = p.category_id
LEFT JOIN product_variants v ON v.product_id = p.product_id AND v.is_active = TRUE
WHERE p.is_active = TRUE
  -- optional filters appended as needed:
  AND p.category_id = ?                                  -- ?category=1
  AND LOWER(p.brand) = LOWER(?)                          -- ?brand=SoundMax
  AND (p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?
       OR EXISTS (SELECT 1 FROM product_variants sv
                  WHERE sv.product_id = p.product_id AND sv.sku LIKE ?))   -- ?search=headphones
  AND COALESCE((SELECT MIN(v.price) FROM product_variants v
                WHERE v.product_id = p.product_id AND v.is_active = TRUE),
               p.base_price) <= ?                        -- ?maxPrice=5000
GROUP BY p.product_id, c.name
ORDER BY min_price ASC;    -- price_asc | price_desc → DESC | rating → rating DESC | default: product_id ASC
LIMIT 12 OFFSET 0;         -- pagination (?page=&limit=)
```

Count query for `totalPages` runs with identical filters.

### Step 2.3 — Product Detail Page (`GET /api/products/:id`)
Three queries assembled into one response:

```sql
-- product + category
SELECT p.*, c.category_id AS cat_id, c.name AS cat_name
FROM products p
LEFT JOIN categories c ON c.category_id = p.category_id
WHERE p.is_active = TRUE AND p.product_id = ?;

-- all purchasable variants (SKU matrix)
SELECT * FROM product_variants
WHERE product_id = ? AND is_active = TRUE ORDER BY variant_id;

-- reviews with reviewer names
SELECT r.review_id, r.user_id, r.product_id, r.rating, r.review_text, r.review_date,
       u.full_name AS user_name
FROM reviews r
LEFT JOIN users u ON u.user_id = r.user_id
WHERE r.product_id = ?
ORDER BY r.review_date DESC;
```

---

## 3. Shopping Cart

### Step 3.1 — Open Cart (`GET /api/cart`)
Cart row is auto-created if missing:

```sql
SELECT * FROM cart WHERE user_id = ?;
INSERT INTO cart (user_id) VALUES (?);      -- only if above returned nothing

-- detailed line items
SELECT ci.cart_item_id, ci.variant_id, ci.quantity,
       v.sku, v.color, v.size, v.storage,
       v.price AS unit_price, v.stock_quantity,
       p.product_id, p.name AS product_name
FROM cart_items ci
JOIN product_variants v ON v.variant_id = ci.variant_id
LEFT JOIN products p ON p.product_id = v.product_id
WHERE ci.cart_id = ?
ORDER BY ci.cart_item_id;

-- subtotal computed in app: SUM(unit_price × quantity)
```

### Step 3.2 — Add to Cart (`POST /api/cart/items`)
Stock validated first, then merge-or-insert on `UNIQUE(cart_id, variant_id)`:

```sql
SELECT stock_quantity, is_active FROM product_variants WHERE variant_id = ?;

SELECT cart_item_id, quantity FROM cart_items WHERE cart_id = ? AND variant_id = ?;

-- if item already in cart (quantity merged):
UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?;

-- else new line:
INSERT INTO cart_items (cart_id, variant_id, quantity) VALUES (?, ?, ?);

-- rejected when quantity > stock_quantity:
--   CHECK chk_cart_items_quantity (quantity > 0), app throws stock error
```

### Step 3.3 — Change Quantity (`PATCH /api/cart/items/:id`) — quantity ≤ 0 deletes the row

```sql
SELECT ci.cart_item_id, ci.variant_id
FROM cart_items ci
WHERE ci.cart_item_id = ? AND ci.cart_id = ?;

SELECT stock_quantity FROM product_variants WHERE variant_id = ?;

UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?;
```

### Step 3.4 — Remove Item (`DELETE /api/cart/items/:id`)

```sql
DELETE FROM cart_items WHERE cart_item_id = ? AND cart_id = ?;
```

### Step 3.5 — Clear Cart (`DELETE /api/cart`)

```sql
DELETE FROM cart_items WHERE cart_id = ?;
```

---

## 4. Addresses

### Step 4.1 — List / Add / Delete Address (`GET|POST|DELETE /api/user/addresses`)

```sql
SELECT * FROM addresses WHERE user_id = ? ORDER BY address_id;

SELECT * FROM addresses WHERE address_id = ?;          -- ownership check at checkout

INSERT INTO addresses
(user_id, full_name, phone, address_line1, address_line2, city, state, pincode, address_type)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);                    -- ENUM('HOME','OFFICE','OTHER')

SELECT COUNT(*) AS cnt FROM orders WHERE address_id = ?;  -- RESTRICT check
DELETE FROM addresses WHERE address_id = ? AND user_id = ?;
```

---

## 5. Checkout — ACID Transaction (`POST /api/checkout`)

All statements run inside ONE transaction with row-level locks
(`backend/src/repositories/mysql/orderRepository.ts → executeCheckout()`):

```sql
START TRANSACTION;

-- 1. Lock the user's cart row
SELECT cart_id FROM cart WHERE user_id = ? FOR UPDATE;

-- 2. Read cart lines
SELECT variant_id, quantity FROM cart_items WHERE cart_id = ? ORDER BY cart_item_id;

-- 3. LOCK variant rows + validate stock atomically (prevents overselling/races)
SELECT v.variant_id, v.sku, v.price, v.stock_quantity, v.product_id, p.name AS product_name
FROM product_variants v
JOIN products p ON p.product_id = v.product_id
WHERE v.variant_id IN (?, ?, ...)
FOR UPDATE;
-- insufficient stock anywhere → ROLLBACK (nothing is written)

-- 4. Create order header (price snapshot moment)
INSERT INTO orders (user_id, address_id, order_status, total_amount)
VALUES (?, ?, 'CONFIRMED', ?);

-- 5. Snapshot immutable line items (product title + unit price frozen here)
INSERT INTO order_items (order_id, variant_id, product_name, price, quantity, discount, total_price)
VALUES (?, ?, ?, ?, ?, 0.00, ?);

-- 6. Deduct inventory
UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE variant_id = ?;

-- 7. Record payment (1:1 with order)
INSERT INTO payments (order_id, payment_method, amount, payment_status, transaction_id)
VALUES (?, ?, ?, 'SUCCESS', ?);       -- ENUM('UPI','CARD','COD','NET_BANKING')

-- 8. Purge purchased lines from cart
DELETE FROM cart_items WHERE cart_id = ?;

COMMIT;     -- any error before this point → ROLLBACK, DB unchanged
```

---

## 6. Order History & Details

### Step 6.1 — My Orders (`GET /api/orders`)
Per order: items + payment + shipping address

```sql
SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC;

SELECT * FROM order_items WHERE order_id = ? ORDER BY order_item_id;
SELECT * FROM payments   WHERE order_id = ?;
SELECT * FROM addresses  WHERE address_id = ?;
```

### Step 6.2 — Single Order (`GET /api/orders/:orderId`)

```sql
SELECT o.* FROM orders o WHERE o.order_id = ? AND o.user_id = ?;   -- scoped to owner

SELECT * FROM order_items WHERE order_id = ? ORDER BY order_item_id;
SELECT * FROM payments   WHERE order_id = ?;
SELECT * FROM addresses  WHERE address_id = ?;
SELECT user_id, full_name, email FROM users WHERE user_id = ?;     -- customer summary (admin view)
```

---

## 7. Reviews

### Step 7.1 — Write a Review (`POST /api/reviews`) — one review per user per product

```sql
INSERT INTO reviews (user_id, product_id, rating, review_text)
VALUES (?, ?, ?, ?);
-- duplicate → UNIQUE uq_user_product_review fires ER_DUP_ENTRY
-- rating outside 1-5 → CHECK chk_reviews_rating rejects
```

### Step 7.2 — Purchase Verification (review gate)

```sql
SELECT 1 AS purchased
FROM order_items oi
JOIN orders o ON o.order_id = oi.order_id
JOIN product_variants v ON v.variant_id = oi.variant_id
WHERE o.user_id = ? AND o.order_status <> 'CANCELLED' AND v.product_id = ?
LIMIT 1;
```

### Step 7.3 — Read Reviews (`GET /api/reviews/product/:productId`)

```sql
SELECT r.review_id, r.user_id, r.product_id, r.rating, r.review_text, r.review_date,
       u.full_name AS user_name
FROM reviews r
LEFT JOIN users u ON u.user_id = r.user_id
WHERE r.product_id = ?
ORDER BY r.review_date DESC;
```

---

## 8. Admin — Inventory Management

### Step 8.1 — Update Variant Price / Stock

```sql
UPDATE product_variants SET price          = ? WHERE variant_id = ?;
UPDATE product_variants SET stock_quantity = ? WHERE variant_id = ?;
-- CHECK constraints reject negatives: chk_variants_price, chk_variants_stock
```

---

## 9. Handy Verification Queries

```sql
USE ecommerce_db;

-- Best-selling variants (aggregation proof for viva)
SELECT variant_id, SUM(quantity) AS total_sold
FROM order_items GROUP BY variant_id ORDER BY total_sold DESC;

-- Revenue per category
SELECT c.name, SUM(oi.total_price) AS revenue
FROM order_items oi
JOIN product_variants v ON v.variant_id = oi.variant_id
JOIN products p ON p.product_id = v.product_id
JOIN categories c ON c.category_id = p.category_id
GROUP BY c.name ORDER BY revenue DESC;

-- Every order with its payment and customer
SELECT o.order_id, u.full_name, o.total_amount, o.order_status,
       pay.payment_method, pay.transaction_id
FROM orders o
JOIN users u ON u.user_id = o.user_id
LEFT JOIN payments pay ON pay.order_id = o.order_id
ORDER BY o.order_date DESC;

-- Live inventory vs sold units
SELECT v.sku, v.stock_quantity, COALESCE(SUM(oi.quantity),0) AS sold
FROM product_variants v
LEFT JOIN order_items oi ON oi.variant_id = v.variant_id
GROUP BY v.variant_id ORDER BY sold DESC;

-- Users who never ordered
SELECT u.full_name FROM users u
LEFT JOIN orders o ON o.user_id = u.user_id
WHERE o.order_id IS NULL;
```
