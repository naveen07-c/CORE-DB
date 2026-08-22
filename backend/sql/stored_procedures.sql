-- ================================================================================
-- VORTEX COMMERCE STORED PROCEDURE: ATOMIC CHECKOUT PROCEDURE
-- ================================================================================

USE vortex_commerce_db;

DROP PROCEDURE IF EXISTS sp_execute_checkout;

DELIMITER $$

CREATE PROCEDURE sp_execute_checkout(
    IN in_user_id INT UNSIGNED,
    IN in_address_id INT UNSIGNED,
    IN in_payment_method VARCHAR(30),
    IN in_transaction_id VARCHAR(100),
    OUT out_order_id INT UNSIGNED,
    OUT out_status_code VARCHAR(20),
    OUT out_message VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_cart_id INT UNSIGNED;
    DECLARE v_item_count INT DEFAULT 0;
    DECLARE v_subtotal DECIMAL(10, 2) DEFAULT 0.00;
    DECLARE v_tax DECIMAL(10, 2) DEFAULT 0.00;
    DECLARE v_shipping DECIMAL(10, 2) DEFAULT 50.00;
    DECLARE v_total DECIMAL(10, 2) DEFAULT 0.00;
    DECLARE v_has_insufficient_stock INT DEFAULT 0;

    -- Error Handler to rollback on any SQL exception
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET out_order_id = 0;
        SET out_status_code = 'ERR_SQL_EXCEPTION';
        SET out_message = 'An unexpected SQL error occurred during checkout.';
    END;

    START TRANSACTION;

    -- 1. Identify User Cart
    SELECT cart_id INTO v_cart_id 
    FROM cart 
    WHERE user_id = in_user_id 
    FOR UPDATE;

    IF v_cart_id IS NULL THEN
        ROLLBACK;
        SET out_order_id = 0;
        SET out_status_code = 'ERR_CART_EMPTY';
        SET out_message = 'No active cart found for this user.';
        LEAVE proc_label;
    END IF;

    -- 2. Check if Cart has items
    SELECT COUNT(*) INTO v_item_count 
    FROM cart_items 
    WHERE cart_id = v_cart_id;

    IF v_item_count = 0 THEN
        ROLLBACK;
        SET out_order_id = 0;
        SET out_status_code = 'ERR_CART_EMPTY';
        SET out_message = 'Shopping cart is empty.';
        LEAVE proc_label;
    END IF;

    -- 3. Lock Variant Rows & Validate Stock Availability (ACID Row Lock)
    SELECT COUNT(*) INTO v_has_insufficient_stock
    FROM cart_items ci
    JOIN product_variants pv ON ci.variant_id = pv.variant_id
    WHERE ci.cart_id = v_cart_id AND pv.stock_quantity < ci.quantity
    FOR UPDATE;

    IF v_has_insufficient_stock > 0 THEN
        ROLLBACK;
        SET out_order_id = 0;
        SET out_status_code = 'ERR_STOCK_DEPLETED';
        SET out_message = 'One or more items in your cart exceeds available inventory.';
        LEAVE proc_label;
    END IF;

    -- 4. Calculate Subtotal from Current Variant Pricing
    SELECT SUM(pv.price * ci.quantity) INTO v_subtotal
    FROM cart_items ci
    JOIN product_variants pv ON ci.variant_id = pv.variant_id
    WHERE ci.cart_id = v_cart_id;

    SET v_tax = ROUND(v_subtotal * 0.18, 2); -- 18% Standard GST
    IF v_subtotal > 1000.00 THEN
        SET v_shipping = 0.00;              -- Free shipping above 1000
    END IF;
    SET v_total = v_subtotal + v_tax + v_shipping;

    -- 5. Create Order Header
    INSERT INTO orders (user_id, address_id, order_status, subtotal_amount, tax_amount, shipping_fee, total_amount)
    VALUES (in_user_id, in_address_id, 'PROCESSING', v_subtotal, v_tax, v_shipping, v_total);

    SET out_order_id = LAST_INSERT_ID();

    -- 6. Insert Order Items (Snapshotting Current Product Title & Price)
    INSERT INTO order_items (
        order_id, 
        variant_id, 
        product_name, 
        variant_details, 
        unit_price, 
        quantity, 
        discount, 
        total_price
    )
    SELECT 
        out_order_id,
        pv.variant_id,
        p.name,
        CONCAT_WS(' / ', pv.color, pv.size, pv.storage),
        pv.price,
        ci.quantity,
        0.00,
        (pv.price * ci.quantity)
    FROM cart_items ci
    JOIN product_variants pv ON ci.variant_id = pv.variant_id
    JOIN products p ON pv.product_id = p.product_id
    WHERE ci.cart_id = v_cart_id;

    -- 7. Deduct Inventory
    UPDATE product_variants pv
    JOIN cart_items ci ON pv.variant_id = ci.variant_id
    SET pv.stock_quantity = pv.stock_quantity - ci.quantity
    WHERE ci.cart_id = v_cart_id;

    -- 8. Create Payment Record (1:1 with Order)
    INSERT INTO payments (order_id, payment_method, amount, payment_status, transaction_id)
    VALUES (out_order_id, in_payment_method, v_total, 'SUCCESS', in_transaction_id);

    -- 9. Purge Cart Items
    DELETE FROM cart_items WHERE cart_id = v_cart_id;

    COMMIT;

    SET out_status_code = 'SUCCESS';
    SET out_message = 'Order placed and settled successfully.';
END $$

DELIMITER ;
