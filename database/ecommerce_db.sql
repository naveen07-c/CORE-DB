-- E-COMMERCE DATABASE MANAGEMENT SYSTEM
-- MySQL 8.0+ | Student DBMS Project

DROP DATABASE IF EXISTS ecommerce_db;
CREATE DATABASE ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecommerce_db;

-- 1. USERS
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- 2. ADDRESSES
CREATE TABLE addresses (
    address_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line1 VARCHAR(200) NOT NULL,
    address_line2 VARCHAR(200),
    city VARCHAR(80) NOT NULL,
    state VARCHAR(80) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    address_type ENUM('HOME','OFFICE','OTHER') NOT NULL DEFAULT 'HOME',
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_addresses_user (user_id)
) ENGINE=InnoDB;

-- 3. CATEGORIES
CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- 4. PRODUCTS
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    brand VARCHAR(100),
    base_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_products_base_price CHECK (base_price >= 0),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id)
        REFERENCES categories(category_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_products_category (category_id),
    INDEX idx_products_name (name)
) ENGINE=InnoDB;

-- 5. PRODUCT_VARIANTS
CREATE TABLE product_variants (
    variant_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    sku VARCHAR(80) NOT NULL UNIQUE,
    color VARCHAR(50),
    size VARCHAR(50),
    storage VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_variants_price CHECK (price >= 0),
    CONSTRAINT chk_variants_stock CHECK (stock_quantity >= 0),
    CONSTRAINT fk_variants_product FOREIGN KEY (product_id)
        REFERENCES products(product_id) ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_variants_product (product_id),
    INDEX idx_variants_sku (sku)
) ENGINE=InnoDB;

-- 6. CART
CREATE TABLE cart (
    cart_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. CART_ITEMS
CREATE TABLE cart_items (
    cart_item_id INT PRIMARY KEY AUTO_INCREMENT,
    cart_id INT NOT NULL,
    variant_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_cart_items_quantity CHECK (quantity > 0),
    CONSTRAINT uq_cart_variant UNIQUE (cart_id, variant_id),
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id)
        REFERENCES cart(cart_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_variant FOREIGN KEY (variant_id)
        REFERENCES product_variants(variant_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_cart_items_variant (variant_id)
) ENGINE=InnoDB;

-- 8. ORDERS
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    address_id INT NOT NULL,
    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    order_status ENUM('PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED')
        NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(10,2) NOT NULL,
    CONSTRAINT chk_orders_total CHECK (total_amount >= 0),
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_orders_address FOREIGN KEY (address_id)
        REFERENCES addresses(address_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_address (address_id),
    INDEX idx_orders_status (order_status),
    INDEX idx_orders_date (order_date)
) ENGINE=InnoDB;

-- 9. ORDER_ITEMS
CREATE TABLE order_items (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    variant_id INT NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(10,2) NOT NULL,
    CONSTRAINT chk_order_items_price CHECK (price >= 0),
    CONSTRAINT chk_order_items_quantity CHECK (quantity > 0),
    CONSTRAINT chk_order_items_discount CHECK (discount >= 0),
    CONSTRAINT chk_order_items_total CHECK (total_price >= 0),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id)
        REFERENCES orders(order_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_order_items_variant FOREIGN KEY (variant_id)
        REFERENCES product_variants(variant_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_variant (variant_id)
) ENGINE=InnoDB;

-- 10. PAYMENTS
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL UNIQUE,
    payment_method ENUM('UPI','CARD','COD','NET_BANKING') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('PENDING','SUCCESS','FAILED','REFUNDED')
        NOT NULL DEFAULT 'PENDING',
    transaction_id VARCHAR(100) UNIQUE,
    payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_payments_amount CHECK (amount >= 0),
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id)
        REFERENCES orders(order_id) ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_payments_status (payment_status)
) ENGINE=InnoDB;

-- 11. REVIEWS
CREATE TABLE reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    rating TINYINT NOT NULL,
    review_text TEXT,
    review_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT uq_user_product_review UNIQUE (user_id, product_id),
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_reviews_product FOREIGN KEY (product_id)
        REFERENCES products(product_id) ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_reviews_product (product_id),
    INDEX idx_reviews_user (user_id)
) ENGINE=InnoDB;



-- USEFUL TEST QUERIES

-- Products with categories:
-- SELECT p.product_id,p.name,c.name AS category
-- FROM products p
-- JOIN categories c ON p.category_id=c.category_id;

-- Product variants:
-- SELECT p.name,v.sku,v.color,v.size,v.price,v.stock_quantity
-- FROM products p
-- JOIN product_variants v ON p.product_id=v.product_id
-- WHERE p.product_id=1;

-- A user's orders:
-- SELECT order_id,order_date,order_status,total_amount
-- FROM orders WHERE user_id=1;

-- Order details:
-- SELECT o.order_id,oi.product_name,oi.price,oi.quantity,oi.total_price
-- FROM orders o
-- JOIN order_items oi ON o.order_id=oi.order_id
-- WHERE o.order_id=1;

-- Reviews:
-- SELECT p.name,u.full_name,r.rating,r.review_text
-- FROM reviews r
-- JOIN users u ON r.user_id=u.user_id
-- JOIN products p ON r.product_id=p.product_id;

-- Best-selling variants:
-- SELECT variant_id,SUM(quantity) AS total_sold
-- FROM order_items
-- GROUP BY variant_id
-- ORDER BY total_sold DESC;