# SQL Queries — Iron & Ivy Commerce

Every SQL statement used in the project — the app's backend queries, plus a full viva-demo set: table views, relationship views, analytics, constraint proofs, transactions, stored procedure and views.

**Two databases live in this repo:**
- `ecommerce_db` (`database/ecommerce_db.sql`) — the schema the Node backend connects to by default (`DB_NAME` in `backend/.env`).
- `iron_and_ivy_db` (`backend/sql/schema.sql` + `seed.sql` + `stored_procedures.sql`) — the fully seeded demo database.

> For the live demo with data, run `backend/sql/schema.sql` then `backend/sql/seed.sql`, and either set `DB_NAME=iron_and_ivy_db` in `backend/.env` or just browse it in MySQL Workbench. All demo queries below use `USE iron_and_ivy_db;`.

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
  COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.product_id), 0.0) AS rating,
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

# VIVA DEMO SET — "Show me the tables / data"

Run against the seeded database:

```sql
USE iron_and_ivy_db;
```

## 9. Schema Inspection — Quick Commands

### 9.1 — List all databases and tables

```sql
SHOW DATABASES;
SHOW TABLES;
```

### 9.2 — Structure of any table (columns, types, keys)

```sql
DESCRIBE users;
DESCRIBE orders;
DESCRIBE order_items;
```

### 9.3 — Full DDL of a table (FKs, CHECKs, ENUMs — examiner favourite)

```sql
SHOW CREATE TABLE orders\G
SHOW CREATE TABLE product_variants\G
```

### 9.4 — All indexes

```sql
SHOW INDEX FROM product_variants;
SHOW INDEX FROM orders;
```

### 9.5 — Row counts of every table in one result

```sql
SELECT 'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL SELECT 'addresses',        COUNT(*) FROM addresses
UNION ALL SELECT 'categories',       COUNT(*) FROM categories
UNION ALL SELECT 'products',         COUNT(*) FROM products
UNION ALL SELECT 'product_variants', COUNT(*) FROM product_variants
UNION ALL SELECT 'cart',             COUNT(*) FROM cart
UNION ALL SELECT 'cart_items',       COUNT(*) FROM cart_items
UNION ALL SELECT 'orders',           COUNT(*) FROM orders
UNION ALL SELECT 'order_items',      COUNT(*) FROM order_items
UNION ALL SELECT 'payments',         COUNT(*) FROM payments
UNION ALL SELECT 'reviews',          COUNT(*) FROM reviews;
```

---

## 10. Table Views — Display Each of the 11 Tables

### 10.1 — USERS (accounts, roles, bcrypt hashes)

```sql
SELECT user_id, full_name, email, phone, role, is_active, created_at
FROM users
ORDER BY user_id;
```

### 10.2 — ADDRESSES with account owner (FK → users)

```sql
SELECT a.address_id, u.full_name AS account_holder, a.full_name AS recipient,
       a.phone, a.address_line1, a.city, a.state, a.pincode, a.address_type, a.is_default
FROM addresses a
JOIN users u ON u.user_id = a.user_id
ORDER BY a.user_id, a.address_id;
```

### 10.3 — CATEGORIES with product count

```sql
SELECT c.category_id, c.name, c.slug, COUNT(p.product_id) AS product_count
FROM categories c
LEFT JOIN products p ON p.category_id = c.category_id
GROUP BY c.category_id, c.name, c.slug
ORDER BY c.category_id;
```

### 10.4 — PRODUCTS with category, variant count and price range

```sql
SELECT p.product_id, p.name, p.brand, c.name AS category, p.base_price,
       COUNT(v.variant_id) AS variants,
       MIN(v.price) AS from_price, MAX(v.price) AS to_price
FROM products p
JOIN categories c ON c.category_id = p.category_id
LEFT JOIN product_variants v ON v.product_id = p.product_id AND v.is_active = TRUE
GROUP BY p.product_id, p.name, p.brand, c.name, p.base_price
ORDER BY p.product_id;
```

### 10.5 — PRODUCT_VARIANTS — the buyable SKU matrix

```sql
SELECT v.variant_id, p.name AS product, v.sku, v.color, v.size, v.storage,
       v.price, v.stock_quantity
FROM product_variants v
JOIN products p ON p.product_id = v.product_id
ORDER BY p.product_id, v.variant_id;
```

### 10.6 — CART — one cart per user (1:1 view)

```sql
SELECT u.user_id, u.full_name, c.cart_id, c.created_at,
       COUNT(ci.cart_item_id) AS line_count,
       COALESCE(SUM(ci.quantity), 0) AS total_units
FROM users u
JOIN cart c ON c.user_id = u.user_id
LEFT JOIN cart_items ci ON ci.cart_id = c.cart_id
GROUP BY u.user_id, u.full_name, c.cart_id, c.created_at
ORDER BY u.user_id;
```

### 10.7 — CART_ITEMS — full cart detail with live prices

```sql
SELECT u.full_name AS customer, p.name AS product, v.sku, v.color, v.size, v.storage,
       ci.quantity, v.price, (v.price * ci.quantity) AS line_total
FROM cart_items ci
JOIN cart c            ON c.cart_id = ci.cart_id
JOIN users u           ON u.user_id = c.user_id
JOIN product_variants v ON v.variant_id = ci.variant_id
JOIN products p        ON p.product_id = v.product_id
ORDER BY u.user_id, ci.cart_item_id;
```

### 10.8 — ORDERS with customer and shipping address

```sql
SELECT o.order_id, u.full_name AS customer, o.order_status,
       o.subtotal_amount, o.tax_amount, o.shipping_fee, o.total_amount, o.order_date,
       CONCAT(a.address_line1, ', ', a.city, ' - ', a.pincode) AS ship_to
FROM orders o
JOIN users u     ON u.user_id = o.user_id
JOIN addresses a ON a.address_id = o.address_id
ORDER BY o.order_date DESC;
```

### 10.9 — ORDER_ITEMS — immutable invoice lines

```sql
SELECT o.order_id, oi.product_name, oi.variant_details,
       oi.unit_price, oi.quantity, oi.discount, oi.total_price
FROM order_items oi
JOIN orders o ON o.order_id = oi.order_id
ORDER BY o.order_id, oi.order_item_id;
```

### 10.10 — PAYMENTS with order and customer

```sql
SELECT pay.payment_id, o.order_id, u.full_name AS customer,
       pay.payment_method, pay.amount, pay.payment_status, pay.transaction_id, pay.payment_date
FROM payments pay
JOIN orders o ON o.order_id = pay.order_id
JOIN users u  ON u.user_id = o.user_id
ORDER BY pay.payment_date DESC;
```

### 10.11 — REVIEWS with reviewer and product

```sql
SELECT r.review_id, u.full_name AS reviewer, p.name AS product,
       r.rating, r.title, r.review_text, r.is_verified, r.review_date
FROM reviews r
JOIN users u    ON u.user_id = r.user_id
JOIN products p ON p.product_id = r.product_id
ORDER BY r.review_date DESC;
```

---

## 11. Relationship Views — Prove the ER Diagram Live

### 11.1 — users 1:N addresses

```sql
SELECT u.full_name, a.address_id, a.city, a.address_type
FROM users u JOIN addresses a ON a.user_id = u.user_id;
```

### 11.2 — categories 1:N products

```sql
SELECT c.name AS category, p.name AS product
FROM categories c JOIN products p ON p.category_id = c.category_id;
```

### 11.3 — products 1:N product_variants

```sql
SELECT p.name AS product, v.sku, v.price
FROM products p JOIN product_variants v ON v.product_id = p.product_id;
```

### 11.4 — users 1:1 cart (UNIQUE user_id guarantees it)

```sql
SELECT u.user_id, u.full_name, c.cart_id
FROM users u JOIN cart c ON c.user_id = u.user_id;
```

### 11.5 — cart 1:N cart_items

```sql
SELECT c.cart_id, ci.cart_item_id, v.sku, ci.quantity
FROM cart c JOIN cart_items ci ON ci.cart_id = c.cart_id
JOIN product_variants v ON v.variant_id = ci.variant_id;
```

### 11.6 — cart_items bridge table (cart × product_variants, M:N resolved)

```sql
SELECT u.full_name AS customer, p.name AS product, v.sku, ci.quantity
FROM cart_items ci
JOIN cart c             ON c.cart_id = ci.cart_id
JOIN users u            ON u.user_id = c.user_id
JOIN product_variants v ON v.variant_id = ci.variant_id
JOIN products p         ON p.product_id = v.product_id;
```

### 11.7 — users 1:N orders

```sql
SELECT u.full_name, o.order_id, o.total_amount, o.order_status
FROM users u JOIN orders o ON o.user_id = u.user_id
ORDER BY u.user_id, o.order_id;
```

### 11.8 — addresses 1:N orders

```sql
SELECT a.address_id, a.city, COUNT(o.order_id) AS orders_placed
FROM addresses a LEFT JOIN orders o ON o.address_id = a.address_id
GROUP BY a.address_id, a.city;
```

### 11.9 — orders 1:N order_items

```sql
SELECT o.order_id, oi.product_name, oi.quantity, oi.total_price
FROM orders o JOIN order_items oi ON oi.order_id = o.order_id;
```

### 11.10 — order_items bridge table (orders × product_variants, M:N resolved)

```sql
SELECT o.order_id, p.name AS product, v.sku, oi.quantity
FROM order_items oi
JOIN orders o           ON o.order_id = oi.order_id
JOIN product_variants v ON v.variant_id = oi.variant_id
JOIN products p         ON p.product_id = v.product_id;
```

### 11.11 — orders 1:1 payments (UNIQUE order_id guarantees it)

```sql
SELECT o.order_id, pay.payment_id, pay.payment_method, pay.amount, pay.payment_status
FROM orders o JOIN payments pay ON pay.order_id = o.order_id;
```

### 11.12 — users 1:N reviews and products 1:N reviews

```sql
SELECT u.full_name AS reviewer, p.name AS product, r.rating
FROM reviews r
JOIN users u    ON u.user_id = r.user_id
JOIN products p ON p.product_id = r.product_id;
```

### 11.13 — FK actions at a glance (CASCADE vs RESTRICT — examiner favourite)

```sql
SELECT CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME, DELETE_RULE
FROM information_schema.REFERENTIAL_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = 'iron_and_ivy_db'
ORDER BY TABLE_NAME;
```

---

## 12. Business & Analytics Scenarios

### 12.1 — Revenue per category (4-table JOIN + GROUP BY)

```sql
SELECT c.name AS category, SUM(oi.total_price) AS revenue
FROM order_items oi
JOIN product_variants v ON v.variant_id = oi.variant_id
JOIN products p         ON p.product_id = v.product_id
JOIN categories c       ON c.category_id = p.category_id
GROUP BY c.name
ORDER BY revenue DESC;
```

### 12.2 — Best-selling variants

```sql
SELECT v.sku, p.name AS product, SUM(oi.quantity) AS total_sold
FROM order_items oi
JOIN product_variants v ON v.variant_id = oi.variant_id
JOIN products p         ON p.product_id = v.product_id
GROUP BY v.variant_id, v.sku, p.name
ORDER BY total_sold DESC
LIMIT 10;
```

### 12.3 — Top customers by total spend

```sql
SELECT u.full_name, u.email, SUM(o.total_amount) AS lifetime_value,
       COUNT(o.order_id) AS orders_placed
FROM users u
JOIN orders o ON o.user_id = u.user_id
GROUP BY u.user_id, u.full_name, u.email
ORDER BY lifetime_value DESC;
```

### 12.4 — Average rating per product (with review count)

```sql
SELECT p.name AS product, ROUND(AVG(r.rating), 2) AS avg_rating, COUNT(r.review_id) AS reviews
FROM products p
LEFT JOIN reviews r ON r.product_id = p.product_id
GROUP BY p.product_id, p.name
HAVING reviews > 0
ORDER BY avg_rating DESC;
```

### 12.5 — Low-stock alert (stock below threshold)

```sql
SELECT v.sku, p.name AS product, v.stock_quantity
FROM product_variants v
JOIN products p ON p.product_id = v.product_id
WHERE v.stock_quantity < 5 AND v.is_active = TRUE
ORDER BY v.stock_quantity ASC;
```

### 12.6 — Users who never ordered (anti-join)

```sql
SELECT u.user_id, u.full_name, u.email
FROM users u
LEFT JOIN orders o ON o.user_id = u.user_id
WHERE o.order_id IS NULL;
```

### 12.7 — Products never sold

```sql
SELECT p.name AS product
FROM products p
LEFT JOIN product_variants v ON v.product_id = p.product_id
LEFT JOIN order_items oi     ON oi.variant_id = v.variant_id
WHERE oi.order_item_id IS NULL;
```

### 12.8 — Orders per status (GROUP BY on ENUM)

```sql
SELECT order_status, COUNT(*) AS orders
FROM orders
GROUP BY order_status
ORDER BY orders DESC;
```

### 12.9 — Payment method distribution

```sql
SELECT payment_method, COUNT(*) AS count, SUM(amount) AS total_collected
FROM payments
GROUP BY payment_method
ORDER BY total_collected DESC;
```

### 12.10 — Revenue per day (DATE_FORMAT grouping)

```sql
SELECT DATE(order_date) AS day, COUNT(*) AS orders, SUM(total_amount) AS revenue
FROM orders
GROUP BY DATE(order_date)
ORDER BY day DESC;
```

### 12.11 — Orders above average order value (nested subquery)

```sql
SELECT o.order_id, u.full_name, o.total_amount
FROM orders o
JOIN users u ON u.user_id = o.user_id
WHERE o.total_amount > (SELECT AVG(total_amount) FROM orders)
ORDER BY o.total_amount DESC;
```

### 12.12 — Correlated subquery: products priced below their category average

```sql
SELECT p.name AS product, v.price, c.name AS category,
       (SELECT AVG(v2.price) FROM product_variants v2
        JOIN products p2 ON p2.product_id = v2.product_id
        WHERE p2.category_id = p.category_id) AS category_avg_price
FROM products p
JOIN categories c       ON c.category_id = p.category_id
JOIN product_variants v ON v.product_id = p.product_id
WHERE v.price < (SELECT AVG(v2.price) FROM product_variants v2
                 JOIN products p2 ON p2.product_id = v2.product_id
                 WHERE p2.category_id = p.category_id)
ORDER BY c.name, v.price;
```

### 12.13 — Verified reviews count per product

```sql
SELECT p.name AS product,
       COUNT(r.review_id) AS total_reviews,
       SUM(r.is_verified) AS verified_reviews
FROM products p
LEFT JOIN reviews r ON r.product_id = p.product_id
GROUP BY p.product_id, p.name
ORDER BY verified_reviews DESC;
```

### 12.14 — Live cart value per user (3-table JOIN + aggregate)

```sql
SELECT u.full_name AS customer, SUM(v.price * ci.quantity) AS cart_value
FROM users u
JOIN cart c       ON c.user_id = u.user_id
JOIN cart_items ci ON ci.cart_id = c.cart_id
JOIN product_variants v ON v.variant_id = ci.variant_id
GROUP BY u.user_id, u.full_name
ORDER BY cart_value DESC;
```

### 12.15 — DISTINCT brands in the catalogue

```sql
SELECT DISTINCT brand FROM products ORDER BY brand;
```

### 12.16 — Search with LIKE (pattern match)

```sql
SELECT p.name, p.brand, p.base_price
FROM products p
WHERE p.name LIKE '%head%' OR p.brand LIKE '%sound%';
```

### 12.17 — Pagination with LIMIT / OFFSET

```sql
SELECT p.name, p.brand, p.base_price
FROM products p
WHERE p.is_active = TRUE
ORDER BY p.product_id
LIMIT 10 OFFSET 0;    -- page 2 → OFFSET 10, page 3 → OFFSET 20 ...
```

### 12.18 — BETWEEN and IN filters

```sql
SELECT p.name, v.price FROM products p
JOIN product_variants v ON v.product_id = p.product_id
WHERE v.price BETWEEN 500 AND 2000;

SELECT order_id, order_status, total_amount FROM orders
WHERE order_status IN ('PENDING', 'PROCESSING');
```

---

## 13. Constraint Demonstrations — "The Schema Defends Itself"

### 13.1 — UNIQUE rejects duplicate email

```sql
INSERT INTO users (full_name, email, password_hash, phone)
VALUES ('Duplicate Test', 'customer@test.com', 'x', '0000000000');
-- ERROR 1062: Duplicate entry 'customer@test.com' for key 'users.email'
```

### 13.2 — UNIQUE rejects duplicate SKU

```sql
INSERT INTO product_variants (product_id, sku, price, stock_quantity)
VALUES (1, 'IVY-TEE-BLK-M', 499.00, 10);
-- ERROR 1062: Duplicate entry (sku already exists)
```

### 13.3 — CHECK rejects negative price

```sql
UPDATE product_variants SET price = -100 WHERE variant_id = 1;
-- ERROR 3819: Check constraint 'chk_variants_price' is violated.
```

### 13.4 — CHECK rejects invalid rating

```sql
INSERT INTO reviews (user_id, product_id, rating, review_text)
VALUES (2, 1, 6, 'rating out of range');
-- ERROR 3819: Check constraint 'chk_reviews_rating' is violated. (rating BETWEEN 1 AND 5)
```

### 13.5 — CHECK rejects zero/negative quantity

```sql
INSERT INTO cart_items (cart_id, variant_id, quantity) VALUES (2, 1, 0);
-- ERROR 3819: Check constraint 'cart_items_chk_1' is violated. (quantity > 0)
```

### 13.6 — Composite UNIQUE blocks review stuffing (one review per user per product)

```sql
INSERT INTO reviews (user_id, product_id, rating, review_text)
VALUES (2, 1, 5, 'second review by same user for same product');
-- ERROR 1062: Duplicate entry for key 'uq_user_product_review'
```

### 13.7 — RESTRICT protects catalogue (delete a category that has products)

```sql
DELETE FROM categories WHERE category_id = 1;
-- ERROR 1451: Cannot delete or update a parent row:
-- a foreign key constraint fails (fk_products_category ... ON DELETE RESTRICT)
```

### 13.8 — RESTRICT preserves history (delete a user who has orders)

```sql
DELETE FROM users WHERE user_id = 2;
-- ERROR 1451: fk_orders_user fails (ON DELETE RESTRICT) — purchase history survives
```

### 13.9 — CASCADE cleans up children (delete a user with no orders)

```sql
-- user with only addresses + cart + reviews:
DELETE FROM users WHERE user_id = 4;
SELECT * FROM addresses WHERE user_id = 4;   -- empty — cascade removed the children
SELECT * FROM cart      WHERE user_id = 4;   -- empty — cascade removed the cart
```

### 13.10 — ENUM rejects a value outside the closed set

```sql
INSERT INTO payments (order_id, payment_method, amount, payment_status, transaction_id)
VALUES (999999, 'CRYPTO', 100, 'SUCCESS', 'TXN-X');
-- ERROR 1265: Data truncated for column 'payment_method'
```

### 13.11 — NOT NULL rejects incomplete data

```sql
INSERT INTO products (category_id, name, brand, description, base_price)
VALUES (1, 'No price product', 'X', 'desc', NULL);
-- ERROR 1048: Column 'base_price' cannot be null
```

---

## 14. ACID / Transaction Demo

### 14.1 — Atomicity proof: ROLLBACK restores the data

```sql
SELECT stock_quantity FROM product_variants WHERE variant_id = 1;   -- note value, e.g. 25

START TRANSACTION;
UPDATE product_variants SET stock_quantity = stock_quantity - 100 WHERE variant_id = 1;
SELECT stock_quantity FROM product_variants WHERE variant_id = 1;   -- shows -75 (uncommitted)
ROLLBACK;
SELECT stock_quantity FROM product_variants WHERE variant_id = 1;   -- back to 25 — nothing stuck
```

### 14.2 — Isolation proof: row lock prevents overselling (TWO MySQL Workbench sessions)

```sql
-- SESSION A (buyer 1)                          -- SESSION B (buyer 2)
START TRANSACTION;
SELECT stock_quantity FROM product_variants
WHERE variant_id = 1 FOR UPDATE;                START TRANSACTION;
-- shows stock = 1                              SELECT stock_quantity
                                                FROM product_variants
                                                WHERE variant_id = 1 FOR UPDATE;
                                                -- ⏳ BLOCKS — waits on A's row lock

UPDATE product_variants
SET stock_quantity = stock_quantity - 1
WHERE variant_id = 1;
COMMIT;
                                                -- B unblocks — now sees stock = 0
                                                ROLLBACK;   -- B's checkout fails:
                                                -- application throws ERR_STOCK_DEPLETED
```

One moment demonstrates: FOR UPDATE locks, isolation, and why stock can never go negative.

### 14.3 — Durability: after COMMIT the order survives a restart

```sql
START TRANSACTION;
INSERT INTO orders (user_id, address_id, order_status, subtotal_amount, tax_amount,
                    shipping_fee, total_amount)
VALUES (2, 1, 'PROCESSING', 1000, 180, 0, 1180);
COMMIT;
-- restart MySQL server, then:
SELECT * FROM orders ORDER BY order_id DESC LIMIT 1;   -- still there — redo log made it durable
```

---

## 15. Stored Procedure — `sp_execute_checkout`

### 15.1 — Seed a cart for the demo user, then call the procedure

```sql
USE iron_and_ivy_db;

-- put items into user 2's cart (cart 2)
INSERT INTO cart_items (cart_id, variant_id, quantity) VALUES (2, 1, 1);
INSERT INTO cart_items (cart_id, variant_id, quantity) VALUES (2, 4, 2);

CALL sp_execute_checkout(2, 1, 'UPI', 'TXN-DEMO-001', @order_id, @status, @msg);
SELECT @order_id AS new_order_id, @status AS status_code, @msg AS message;
```

### 15.2 — Verify the atomic result (all-or-nothing)

```sql
SELECT * FROM orders     WHERE order_id = @order_id;   -- header with subtotal + 18% tax + shipping
SELECT * FROM order_items WHERE order_id = @order_id;  -- snapshot lines (frozen prices)
SELECT * FROM payments   WHERE order_id = @order_id;   -- exactly one payment, SUCCESS
SELECT * FROM cart_items WHERE cart_id = 2;            -- empty — cart purged
SELECT stock_quantity FROM product_variants WHERE variant_id IN (1, 4);   -- inventory deducted
```

### 15.3 — Error handling demo (empty cart → clean structured error, no partial writes)

```sql
CALL sp_execute_checkout(2, 1, 'UPI', 'TXN-DEMO-002', @order_id, @status, @msg);
SELECT @order_id, @status, @msg;   -- ERR_CART_EMPTY / ERR_STOCK_DEPLETED — nothing written
```

---

## 16. Reusable SQL Views (CREATE VIEW)

### 16.1 — Order invoice view (joins 5 tables — one-line invoice lookup)

```sql
CREATE OR REPLACE VIEW v_order_invoice AS
SELECT o.order_id, o.order_date, o.order_status, o.total_amount,
       u.full_name AS customer, u.email,
       a.address_line1, a.city, a.pincode,
       oi.product_name, oi.variant_details, oi.unit_price, oi.quantity, oi.total_price,
       pay.payment_method, pay.payment_status, pay.transaction_id
FROM orders o
JOIN users u         ON u.user_id = o.user_id
JOIN addresses a     ON a.address_id = o.address_id
JOIN order_items oi  ON oi.order_id = o.order_id
LEFT JOIN payments pay ON pay.order_id = o.order_id;

SELECT * FROM v_order_invoice WHERE order_id = 1;
```

### 16.2 — Product catalogue summary view

```sql
CREATE OR REPLACE VIEW v_product_summary AS
SELECT p.product_id, p.name, p.brand, c.name AS category,
       COUNT(v.variant_id) AS variant_count,
       MIN(v.price) AS min_price, MAX(v.price) AS max_price,
       COALESCE(SUM(v.stock_quantity), 0) AS total_stock
FROM products p
JOIN categories c         ON c.category_id = p.category_id
LEFT JOIN product_variants v ON v.product_id = p.product_id AND v.is_active = TRUE
GROUP BY p.product_id, p.name, p.brand, c.name;

SELECT * FROM v_product_summary ORDER BY min_price DESC;
```

### 16.3 — Low-stock view

```sql
CREATE OR REPLACE VIEW v_low_stock AS
SELECT v.sku, p.name AS product, v.color, v.size, v.storage, v.stock_quantity
FROM product_variants v
JOIN products p ON p.product_id = v.product_id
WHERE v.stock_quantity < 5 AND v.is_active = TRUE;

SELECT * FROM v_low_stock;
```

### 16.4 — Manage views

```sql
SHOW FULL TABLES WHERE Table_type = 'VIEW';   -- list all views
ALTER VIEW v_low_stock AS
SELECT v.sku, v.stock_quantity FROM product_variants v WHERE v.stock_quantity < 10;
DROP VIEW IF EXISTS v_low_stock;
```

---

## 17. Handy Verification Queries

```sql
USE iron_and_ivy_db;

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
GROUP BY v.variant_id
ORDER BY sold DESC;

-- Snapshot integrity proof: invoice price vs live catalogue price
SELECT oi.product_name, oi.unit_price AS paid_price, v.price AS current_price,
       (v.price - oi.unit_price) AS drift
FROM order_items oi
JOIN product_variants v ON v.variant_id = oi.variant_id
HAVING drift <> 0;   -- rows appear only AFTER a price change — the snapshot did its job
```
