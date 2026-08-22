-- ================================================================================
-- VORTEX COMMERCE SEED DATA SCRIPT (SECTION 5.1 SPECIFICATION)
-- ================================================================================

USE vortex_commerce_db;

-- 1. USERS
-- Passwords hashed for 'Pass123!'
INSERT INTO users (user_id, full_name, email, password_hash, phone, role, is_active)
VALUES 
(1, 'System Administrator', 'admin@vortex.com', '$2a$10$0zBsmKvZ4VjK6yR5s5/bI.yOqV.yN5mfgYgJqRjT07xKz.Kq8OQxO', '9876543210', 'ADMIN', TRUE),
(2, 'Jane Customer', 'customer@test.com', '$2a$10$0zBsmKvZ4VjK6yR5s5/bI.yOqV.yN5mfgYgJqRjT07xKz.Kq8OQxO', '9123456780', 'CUSTOMER', TRUE)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- 2. 1:1 CARTS FOR USERS
INSERT INTO cart (cart_id, user_id)
VALUES (1, 1), (2, 2)
ON DUPLICATE KEY UPDATE user_id = VALUES(user_id);

-- 3. ADDRESSES
INSERT INTO addresses (address_id, user_id, full_name, phone, address_line1, address_line2, city, state, pincode, address_type, is_default)
VALUES 
(1, 2, 'Jane Customer', '9123456780', '404 Relational Drive, Suite 800', 'Tech Park Corridor', 'San Francisco', 'CA', '94107', 'HOME', TRUE)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- 4. CATEGORIES
INSERT INTO categories (category_id, name, slug, description, image_url, is_active)
VALUES 
(1, 'Laptops & Computers', 'laptops-computers', 'High performance laptops, developer ultrabooks, and workstations.', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80', TRUE),
(2, 'Smartphones & Tablets', 'smartphones-tablets', 'Next-gen flagship mobile devices with high refresh OLED screens.', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80', TRUE),
(3, 'Audio & Wearables', 'audio-wearables', 'Active Noise Cancelling headphones, audiophile monitors, and smart wearables.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 5. PRODUCTS
INSERT INTO products (product_id, category_id, name, slug, brand, description, base_price, is_active)
VALUES 
(1, 1, 'ProBook 14X', 'probook-14x', 'VORTEX Tech', 'Flagship engineering ultrabook featuring CNC aluminum unibody, Liquid Retina XDR display, and 18-hour battery longevity.', 899.00, TRUE),
(2, 3, 'AeroPulse ANC Headphones', 'aeropulse-anc-headphones', 'AeroAcoustics', 'Studio-grade wireless over-ear headphones with 45dB hybrid active noise cancellation and lossless spatial audio.', 199.00, TRUE),
(3, 2, 'Galaxy Pro S26', 'galaxy-pro-s26', 'NovaTech', 'Flagship 5G smartphone equipped with 200MP computational camera, Snapdragon Gen 4 silicon, and Dynamic AMOLED 2X display.', 799.00, TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 6. PRODUCT_VARIANTS
INSERT INTO product_variants (variant_id, product_id, sku, color, size, storage, price, stock_quantity, image_url, is_active)
VALUES 
(1, 1, 'PB-14X-SG-16-512', 'Space Gray', '14-inch', '16GB RAM / 512GB SSD', 899.00, 15, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', TRUE),
(2, 1, 'PB-14X-SL-32-1TB', 'Silver', '14-inch', '32GB RAM / 1TB SSD', 1199.00, 8, 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80', TRUE),
(3, 2, 'AP-ANC-BLK', 'Matte Black', 'Over-Ear', '40mm Titanium Drivers', 199.00, 25, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', TRUE),
(4, 2, 'AP-ANC-WHT', 'Ivory White', 'Over-Ear', '40mm Titanium Drivers', 199.00, 12, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80', TRUE),
(5, 3, 'GP-S26-BLK-128', 'Phantom Black', '6.7-inch AMOLED', '128GB UFS 4.0', 799.00, 20, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80', TRUE),
(6, 3, 'GP-S26-BLK-256', 'Phantom Black', '6.7-inch AMOLED', '256GB UFS 4.0', 899.00, 14, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80', TRUE)
ON DUPLICATE KEY UPDATE sku = VALUES(sku);

-- 7. REVIEWS
INSERT INTO reviews (review_id, user_id, product_id, rating, title, review_text, is_verified)
VALUES 
(1, 2, 1, 5, 'Phenomenal Development Workstation', 'The thermal performance and compiling speeds on the ProBook 14X are unbelievable. Build quality is top tier.', TRUE)
ON DUPLICATE KEY UPDATE rating = VALUES(rating);
