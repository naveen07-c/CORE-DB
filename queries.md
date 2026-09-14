# SELECT Queries — Iron & Ivy Commerce (iron_and_ivy_db)

Only SELECT queries to prove the database is seeded and working. Run against the seeded demo DB:

```sql
USE iron_and_ivy_db;
```

---

## 1. Schema & Table Verification

### 1.1 — List all tables

```sql
SHOW TABLES;
```

### 1.2 — Row counts for all 11 tables (one query)

```sql
SELECT 'users' AS table_name, COUNT(*) AS rows FROM users
UNION ALL SELECT 'addresses', COUNT(*) FROM addresses
UNION ALL SELECT 'categories', COUNT(*) FROM categories
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'product_variants', COUNT(*) FROM product_variants
UNION ALL SELECT 'cart', COUNT(*) FROM cart
UNION ALL SELECT 'cart_items', COUNT(*) FROM cart_items
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL SELECT 'payments', COUNT(*) FROM payments
UNION ALL SELECT 'reviews', COUNT(*) FROM reviews;
```

### 1.3 — Describe each table (columns, keys)

```sql
DESCRIBE users;
DESCRIBE addresses;
DESCRIBE categories;
DESCRIBE products;
DESCRIBE product_variants;
DESCRIBE cart;
DESCRIBE cart_items;
DESCRIBE orders;
DESCRIBE order_items;
DESCRIBE payments;
DESCRIBE reviews;
```

---

## 2. Show Every Table — Data Views

### 2.1 — USERS (2 rows)

```sql
SELECT user_id, full_name, email, phone, role, is_active, created_at
FROM users ORDER BY user_id;
```

### 2.2 — ADDRESSES with owner (1 row)

```sql
SELECT a.address_id, u.full_name AS account_holder, a.full_name AS recipient,
       a.address_line1, a.city, a.state, a.pincode, a.address_type, a.is_default
FROM addresses a JOIN users u ON u.user_id = a.user_id;
```

### 2.3 — CATEGORIES with product counts (3 rows)

```sql
SELECT c.category_id, c.name, c.slug, COUNT(p.product_id) AS product_count
FROM categories c LEFT JOIN products p ON p.category_id = c.category_id
GROUP BY c.category_id, c.name, c.slug ORDER BY c.category_id;
```

### 2.4 — PRODUCTS with category, variant range (3 rows)

```sql
SELECT p.product_id, p.name, p.brand, c.name AS category, p.base_price,
       COUNT(v.variant_id) AS variants, MIN(v.price) AS min_price, MAX(v.price) AS max_price
FROM products p
JOIN categories c ON c.category_id = p.category_id
LEFT JOIN product_variants v ON v.product_id = p.product_id AND v.is_active = TRUE
GROUP BY p.product_id, p.name, p.brand, c.name, p.base_price ORDER BY p.product_id;
```

### 2.5 — PRODUCT_VARIANTS — SKU matrix (6 rows)

```sql
SELECT v.variant_id, p.name AS product, v.sku, v.color, v.size, v.storage,
       v.price, v.stock_quantity
FROM product_variants v JOIN products p ON p.product_id = v.product_id
ORDER BY p.product_id, v.variant_id;
```

### 2.6 — CART — one per user (2 rows)

```sql
SELECT u.user_id, u.full_name, c.cart_id, c.created_at,
       COUNT(ci.cart_item_id) AS lines, COALESCE(SUM(ci.quantity),0) AS units
FROM users u JOIN cart c ON c.user_id = u.user_id
LEFT JOIN cart_items ci ON ci.cart_id = c.cart_id
GROUP BY u.user_id, u.full_name, c.cart_id, c.created_at ORDER BY u.user_id;
```

### 2.7 — CART_ITEMS with product details (seeded: empty until demo)

```sql
SELECT u.full_name AS customer, p.name AS product, v.sku, v.color, v.size, v.storage,
       ci.quantity, v.price, (v.price * ci.quantity) AS line_total
FROM cart_items ci
JOIN cart c ON c.cart_id = ci.cart_id
JOIN users u ON u.user_id = c.user_id
JOIN product_variants v ON v.variant_id = ci.variant_id
JOIN products p ON p.product_id = v.product_id
ORDER BY u.user_id, ci.cart_item_id;
```

### 2.8 — ORDERS with customer + address (populated after checkout)

```sql
SELECT o.order_id, u.full_name AS customer, o.order_status,
       o.subtotal_amount, o.tax_amount, o.shipping_fee, o.total_amount, o.order_date,
       CONCAT(a.address_line1, ', ', a.city, ' - ', a.pincode) AS ship_to
FROM orders o
JOIN users u ON u.user_id = o.user_id
JOIN addresses a ON a.address_id = o.address_id
ORDER BY o.order_date DESC;
```

### 2.9 — ORDER_ITEMS — invoice snapshot (populated after checkout)

```sql
SELECT o.order_id, oi.product_name, oi.variant_details,
       oi.unit_price, oi.quantity, oi.discount, oi.total_price
FROM order_items oi JOIN orders o ON o.order_id = oi.order_id
ORDER BY o.order_id, oi.order_item_id;
```

### 2.10 — PAYMENTS with order + customer (populated after checkout)

```sql
SELECT pay.payment_id, o.order_id, u.full_name AS customer,
       pay.payment_method, pay.amount, pay.payment_status, pay.transaction_id, pay.payment_date
FROM payments pay
JOIN orders o ON o.order_id = pay.order_id
JOIN users u ON u.user_id = o.user_id
ORDER BY pay.payment_date DESC;
```

### 2.11 — REVIEWS with reviewer + product (1 seeded row)

```sql
SELECT r.review_id, u.full_name AS reviewer, p.name AS product,
       r.rating, r.title, r.review_text, r.is_verified, r.review_date
FROM reviews r
JOIN users u ON u.user_id = r.user_id
JOIN products p ON p.product_id = r.product_id
ORDER BY r.review_date DESC;
```

---

## 3. Relationship Proof — ER Diagram Live

### 3.1 — users 1→N addresses

```sql
SELECT u.full_name, a.address_id, a.city FROM users u JOIN addresses a ON a.user_id = u.user_id;
```

### 3.2 — categories 1→N products

```sql
SELECT c.name AS category, p.name AS product FROM categories c JOIN products p ON p.category_id = c.category_id;
```

### 3.3 — products 1→N product_variants

```sql
SELECT p.name AS product, v.sku, v.price FROM products p JOIN product_variants v ON v.product_id = p.product_id;
```

### 3.4 — users 1:1 cart (UNIQUE user_id)

```sql
SELECT u.user_id, u.full_name, c.cart_id FROM users u JOIN cart c ON c.user_id = u.user_id;
```

### 3.5 — cart 1→N cart_items (bridge)

```sql
SELECT c.cart_id, ci.cart_item_id, v.sku, ci.quantity
FROM cart c JOIN cart_items ci ON ci.cart_id = c.cart_id
JOIN product_variants v ON v.variant_id = ci.variant_id;
```

### 3.6 — users 1→N orders

```sql
SELECT u.full_name, o.order_id, o.total_amount FROM users u JOIN orders o ON o.user_id = u.user_id;
```

### 3.7 — addresses 1→N orders

```sql
SELECT a.address_id, a.city, COUNT(o.order_id) AS orders_placed
FROM addresses a LEFT JOIN orders o ON o.address_id = a.address_id
GROUP BY a.address_id, a.city;
```

### 3.8 — orders 1→N order_items

```sql
SELECT o.order_id, oi.product_name, oi.quantity, oi.total_price
FROM orders o JOIN order_items oi ON oi.order_id = o.order_id;
```

### 3.9 — order_items bridge (orders × product_variants)

```sql
SELECT o.order_id, p.name AS product, v.sku, oi.quantity
FROM order_items oi
JOIN orders o ON o.order_id = oi.order_id
JOIN product_variants v ON v.variant_id = oi.variant_id
JOIN products p ON p.product_id = v.product_id;
```

### 3.10 — orders 1:1 payments (UNIQUE order_id)

```sql
SELECT o.order_id, pay.payment_method, pay.amount, pay.payment_status
FROM orders o JOIN payments pay ON pay.order_id = o.order_id;
```

### 3.11 — users 1→N reviews, products 1→N reviews

```sql
SELECT u.full_name AS reviewer, p.name AS product, r.rating
FROM reviews r JOIN users u ON u.user_id = r.user_id JOIN products p ON p.product_id = r.product_id;
```

### 3.12 — FK actions at a glance (CASCADE vs RESTRICT)

```sql
SELECT CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME, DELETE_RULE
FROM information_schema.REFERENTIAL_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = 'iron_and_ivy_db' ORDER BY TABLE_NAME;
```

---

## 4. Analytics / Business Queries (work after checkout creates data)

### 4.1 — Revenue per category

```sql
SELECT c.name AS category, SUM(oi.total_price) AS revenue
FROM order_items oi
JOIN product_variants v ON v.variant_id = oi.variant_id
JOIN products p ON p.product_id = v.product_id
JOIN categories c ON c.category_id = p.category_id
GROUP BY c.name ORDER BY revenue DESC;
```

### 4.2 — Best-selling variants

```sql
SELECT v.sku, p.name AS product, SUM(oi.quantity) AS total_sold
FROM order_items oi
JOIN product_variants v ON v.variant_id = oi.variant_id
JOIN products p ON p.product_id = v.product_id
GROUP BY v.variant_id, v.sku, p.name ORDER BY total_sold DESC LIMIT 10;
```

### 4.3 — Top customers by spend

```sql
SELECT u.full_name, u.email, SUM(o.total_amount) AS lifetime_value, COUNT(o.order_id) AS orders
FROM users u JOIN orders o ON o.user_id = u.user_id
GROUP BY u.user_id, u.full_name, u.email ORDER BY lifetime_value DESC;
```

### 4.4 — Average rating per product

```sql
SELECT p.name AS product, ROUND(AVG(r.rating),2) AS avg_rating, COUNT(r.review_id) AS reviews
FROM products p LEFT JOIN reviews r ON r.product_id = p.product_id
GROUP BY p.product_id, p.name HAVING reviews > 0 ORDER BY avg_rating DESC;
```

### 4.5 — Low-stock variants

```sql
SELECT v.sku, p.name AS product, v.stock_quantity
FROM product_variants v JOIN products p ON p.product_id = v.product_id
WHERE v.stock_quantity < 5 AND v.is_active = TRUE ORDER BY v.stock_quantity ASC;
```

### 4.6 — Users who never ordered (anti-join)

```sql
SELECT u.user_id, u.full_name, u.email
FROM users u LEFT JOIN orders o ON o.user_id = u.user_id
WHERE o.order_id IS NULL;
```

### 4.7 — Products never sold

```sql
SELECT p.name AS product
FROM products p
LEFT JOIN product_variants v ON v.product_id = p.product_id
LEFT JOIN order_items oi ON oi.variant_id = v.variant_id
WHERE oi.order_item_id IS NULL;
```

### 4.8 — Orders by status

```sql
SELECT order_status, COUNT(*) AS orders FROM orders GROUP BY order_status ORDER BY orders DESC;
```

### 4.9 — Payment method distribution

```sql
SELECT payment_method, COUNT(*) AS count, SUM(amount) AS total
FROM payments GROUP BY payment_method ORDER BY total DESC;
```

### 4.10 — Revenue per day

```sql
SELECT DATE(order_date) AS day, COUNT(*) AS orders, SUM(total_amount) AS revenue
FROM orders GROUP BY DATE(order_date) ORDER BY day DESC;
```

### 4.11 — Orders above average value

```sql
SELECT o.order_id, u.full_name, o.total_amount
FROM orders o JOIN users u ON u.user_id = o.user_id
WHERE o.total_amount > (SELECT AVG(total_amount) FROM orders)
ORDER BY o.total_amount DESC;
```

### 4.12 — Verified reviews per product

```sql
SELECT p.name AS product, COUNT(r.review_id) AS total, SUM(r.is_verified) AS verified
FROM products p LEFT JOIN reviews r ON r.product_id = p.product_id
GROUP BY p.product_id, p.name ORDER BY verified DESC;
```

### 4.13 — Live cart value per user

```sql
SELECT u.full_name AS customer, SUM(v.price * ci.quantity) AS cart_value
FROM users u JOIN cart c ON c.user_id = u.user_id
JOIN cart_items ci ON ci.cart_id = c.cart_id
JOIN product_variants v ON v.variant_id = ci.variant_id
GROUP BY u.user_id, u.full_name ORDER BY cart_value DESC;
```

### 4.14 — Distinct brands

```sql
SELECT DISTINCT brand FROM products ORDER BY brand;
```

### 4.15 — Search with LIKE

```sql
SELECT p.name, p.brand, p.base_price FROM products p
WHERE p.name LIKE '%probook%' OR p.brand LIKE '%iron%';
```

### 4.16 — Pagination (page 1, 10 rows)

```sql
SELECT p.name, p.brand, p.base_price FROM products p
WHERE p.is_active = TRUE ORDER BY p.product_id LIMIT 10 OFFSET 0;
```

### 4.17 — BETWEEN filter

```sql
SELECT p.name, v.price FROM products p
JOIN product_variants v ON v.product_id = p.product_id
WHERE v.price BETWEEN 500 AND 2000;
```

### 4.18 — IN filter

```sql
SELECT order_id, order_status, total_amount FROM orders
WHERE order_status IN ('PENDING', 'PROCESSING');
```

---

## 5. Snapshot Integrity Proof

### 5.1 — Invoice price vs live catalogue price

```sql
SELECT oi.product_name, oi.unit_price AS paid_price, v.price AS current_price,
       (v.price - oi.unit_price) AS drift
FROM order_items oi JOIN product_variants v ON v.variant_id = oi.variant_id
HAVING drift <> 0;
-- Empty = snapshots are accurate; rows appear only after a price change
```

---

## 6. SQL Views (CREATE + SELECT)

### 6.1 — Order invoice view

```sql
CREATE OR REPLACE VIEW v_order_invoice AS
SELECT o.order_id, o.order_date, o.order_status, o.total_amount,
       u.full_name AS customer, u.email, a.address_line1, a.city, a.pincode,
       oi.product_name, oi.variant_details, oi.unit_price, oi.quantity, oi.total_price,
       pay.payment_method, pay.payment_status, pay.transaction_id
FROM orders o
JOIN users u ON u.user_id = o.user_id
JOIN addresses a ON a.address_id = o.address_id
JOIN order_items oi ON oi.order_id = o.order_id
LEFT JOIN payments pay ON pay.order_id = o.order_id;

SELECT * FROM v_order_invoice WHERE order_id = 1;
```

### 6.2 — Product summary view

```sql
CREATE OR REPLACE VIEW v_product_summary AS
SELECT p.product_id, p.name, p.brand, c.name AS category,
       COUNT(v.variant_id) AS variants, MIN(v.price) AS min_price, MAX(v.price) AS max_price,
       COALESCE(SUM(v.stock_quantity),0) AS total_stock
FROM products p JOIN categories c ON c.category_id = p.category_id
LEFT JOIN product_variants v ON v.product_id = p.product_id AND v.is_active = TRUE
GROUP BY p.product_id, p.name, p.brand, c.name;

SELECT * FROM v_product_summary ORDER BY min_price DESC;
```

### 6.3 — Low-stock view

```sql
CREATE OR REPLACE VIEW v_low_stock AS
SELECT v.sku, p.name AS product, v.color, v.size, v.storage, v.stock_quantity
FROM product_variants v JOIN products p ON p.product_id = v.product_id
WHERE v.stock_quantity < 5 AND v.is_active = TRUE;

SELECT * FROM v_low_stock;
```

### 6.4 — List views

```sql
SHOW FULL TABLES WHERE Table_type = 'VIEW';
```