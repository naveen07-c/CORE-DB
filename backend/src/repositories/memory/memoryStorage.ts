import bcrypt from 'bcryptjs';
import {
  User,
  Address,
  Category,
  Product,
  ProductVariant,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Payment,
  Review,
} from '../../types';

class MemoryStorage {
  public users: User[] = [];
  public addresses: Address[] = [];
  public categories: Category[] = [];
  public products: Product[] = [];
  public productVariants: ProductVariant[] = [];
  public carts: Cart[] = [];
  public cartItems: CartItem[] = [];
  public orders: Order[] = [];
  public orderItems: OrderItem[] = [];
  public payments: Payment[] = [];
  public reviews: Review[] = [];

  // Auto-increment counters
  private nextUserId = 1;
  private nextAddressId = 1;
  private nextCategoryId = 1;
  private nextProductId = 1;
  private nextVariantId = 1;
  private nextCartId = 1;
  private nextCartItemId = 1;
  private nextOrderId = 1;
  private nextOrderItemId = 1;
  private nextPaymentId = 1;
  private nextReviewId = 1;

  constructor() {
    this.seedInitialData();
  }

  public getNextUserId() { return this.nextUserId++; }
  public getNextAddressId() { return this.nextAddressId++; }
  public getNextCategoryId() { return this.nextCategoryId++; }
  public getNextProductId() { return this.nextProductId++; }
  public getNextVariantId() { return this.nextVariantId++; }
  public getNextCartId() { return this.nextCartId++; }
  public getNextCartItemId() { return this.nextCartItemId++; }
  public getNextOrderId() { return this.nextOrderId++; }
  public getNextOrderItemId() { return this.nextOrderItemId++; }
  public getNextPaymentId() { return this.nextPaymentId++; }
  public getNextReviewId() { return this.nextReviewId++; }

  private addProduct(
    categoryId: number,
    name: string,
    brand: string,
    description: string,
    basePrice: number,
    variants: Array<{
      sku: string;
      color?: string | null;
      size?: string | null;
      storage?: string | null;
      price?: number;
      stockQuantity?: number;
    }>
  ): Product {
    const createdAt = new Date(Date.now() + this.products.length * 60 * 1000);
    const product: Product = {
      productId: this.getNextProductId(),
      categoryId,
      name,
      description,
      brand,
      basePrice,
      isActive: true,
      createdAt,
    };
    this.products.push(product);

    variants.forEach((v) => {
      const variant: ProductVariant = {
        variantId: this.getNextVariantId(),
        productId: product.productId,
        sku: v.sku,
        color: v.color ?? null,
        size: v.size ?? null,
        storage: v.storage ?? null,
        price: v.price ?? basePrice,
        stockQuantity: v.stockQuantity ?? 10,
        isActive: true,
        createdAt,
      };
      this.productVariants.push(variant);
    });

    return product;
  }

  private seedInitialData() {
    const passwordHash = bcrypt.hashSync('Pass123!', 10);
    const now = new Date();

    // 1. Users (matching ecommerce_db.sql seed data)
    const user1: User = {
      userId: this.getNextUserId(),
      fullName: 'Rahul Kumar',
      email: 'rahul@example.com',
      password: passwordHash,
      phone: '9876543210',
      isActive: true,
      createdAt: now,
    };
    const user2: User = {
      userId: this.getNextUserId(),
      fullName: 'Priya Sharma',
      email: 'priya@example.com',
      password: passwordHash,
      phone: '9123456780',
      isActive: true,
      createdAt: now,
    };
    const user3: User = {
      userId: this.getNextUserId(),
      fullName: 'Arjun Patel',
      email: 'arjun@example.com',
      password: passwordHash,
      phone: '9988776655',
      isActive: true,
      createdAt: now,
    };
    this.users.push(user1, user2, user3);

    // 2. Addresses
    this.addresses.push(
      {
        addressId: this.getNextAddressId(),
        userId: user1.userId,
        fullName: 'Rahul Kumar',
        phone: '9876543210',
        addressLine1: '12 MG Road',
        addressLine2: 'Near City Mall',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        addressType: 'HOME',
        createdAt: now,
      },
      {
        addressId: this.getNextAddressId(),
        userId: user1.userId,
        fullName: 'Rahul Kumar',
        phone: '9876543210',
        addressLine1: '45 College Road',
        addressLine2: null,
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560010',
        addressType: 'OFFICE',
        createdAt: now,
      },
      {
        addressId: this.getNextAddressId(),
        userId: user2.userId,
        fullName: 'Priya Sharma',
        phone: '9123456780',
        addressLine1: '22 Park Street',
        addressLine2: null,
        city: 'Kolkata',
        state: 'West Bengal',
        pincode: '700016',
        addressType: 'HOME',
        createdAt: now,
      },
      {
        addressId: this.getNextAddressId(),
        userId: user3.userId,
        fullName: 'Arjun Patel',
        phone: '9988776655',
        addressLine1: '18 University Road',
        addressLine2: null,
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380009',
        addressType: 'HOME',
        createdAt: now,
      }
    );

    // 3. 1:1 Carts for Users
    this.carts.push(
      { cartId: this.getNextCartId(), userId: user1.userId, createdAt: now, updatedAt: now },
      { cartId: this.getNextCartId(), userId: user2.userId, createdAt: now, updatedAt: now },
      { cartId: this.getNextCartId(), userId: user3.userId, createdAt: now, updatedAt: now }
    );

    // 4. Categories
    const catElectronics: Category = {
      categoryId: this.getNextCategoryId(),
      name: 'Electronics',
      description: 'Electronic devices and accessories',
      isActive: true,
      createdAt: now,
    };
    const catShoes: Category = {
      categoryId: this.getNextCategoryId(),
      name: 'Shoes',
      description: 'Sports, casual and formal shoes',
      isActive: true,
      createdAt: now,
    };
    const catBooks: Category = {
      categoryId: this.getNextCategoryId(),
      name: 'Books',
      description: 'Books and educational material',
      isActive: true,
      createdAt: now,
    };
    const catAccessories: Category = {
      categoryId: this.getNextCategoryId(),
      name: 'Accessories',
      description: 'Everyday accessories',
      isActive: true,
      createdAt: now,
    };
    this.categories.push(catElectronics, catShoes, catBooks, catAccessories);

    // 5. Products & Variants
    // Product 1: Wireless Headphones
    const prod1: Product = {
      productId: this.getNextProductId(),
      categoryId: catElectronics.categoryId,
      name: 'Wireless Headphones',
      description: 'Over-ear wireless headphones',
      brand: 'SoundMax',
      basePrice: 4999.00,
      isActive: true,
      createdAt: now,
    };
    this.products.push(prod1);

    const v1_1: ProductVariant = {
      variantId: this.getNextVariantId(),
      productId: prod1.productId,
      sku: 'SMX-WH-BLK',
      color: 'Black',
      size: null,
      storage: null,
      price: 4999.00,
      stockQuantity: 20,
      isActive: true,
      createdAt: now,
    };
    const v1_2: ProductVariant = {
      variantId: this.getNextVariantId(),
      productId: prod1.productId,
      sku: 'SMX-WH-WHT',
      color: 'White',
      size: null,
      storage: null,
      price: 5199.00,
      stockQuantity: 15,
      isActive: true,
      createdAt: now,
    };
    this.productVariants.push(v1_1, v1_2);

    // Product 2: Smart Watch
    const prod2: Product = {
      productId: this.getNextProductId(),
      categoryId: catElectronics.categoryId,
      name: 'Smart Watch',
      description: 'Fitness and notification smartwatch',
      brand: 'TechTime',
      basePrice: 8999.00,
      isActive: true,
      createdAt: now,
    };
    this.products.push(prod2);

    const v2_1: ProductVariant = {
      variantId: this.getNextVariantId(),
      productId: prod2.productId,
      sku: 'TT-SW-BLK',
      color: 'Black',
      size: null,
      storage: '32GB',
      price: 8999.00,
      stockQuantity: 10,
      isActive: true,
      createdAt: now,
    };
    const v2_2: ProductVariant = {
      variantId: this.getNextVariantId(),
      productId: prod2.productId,
      sku: 'TT-SW-SLV',
      color: 'Silver',
      size: null,
      storage: '32GB',
      price: 9299.00,
      stockQuantity: 8,
      isActive: true,
      createdAt: now,
    };
    this.productVariants.push(v2_1, v2_2);

    // Product 3: Running Shoes
    const prod3: Product = {
      productId: this.getNextProductId(),
      categoryId: catShoes.categoryId,
      name: 'Running Shoes',
      description: 'Lightweight running shoes',
      brand: 'Stride',
      basePrice: 3499.00,
      isActive: true,
      createdAt: now,
    };
    this.products.push(prod3);

    const v3_1: ProductVariant = {
      variantId: this.getNextVariantId(),
      productId: prod3.productId,
      sku: 'STR-RUN-BLK-8',
      color: 'Black',
      size: '8',
      storage: null,
      price: 3499.00,
      stockQuantity: 25,
      isActive: true,
      createdAt: now,
    };
    const v3_2: ProductVariant = {
      variantId: this.getNextVariantId(),
      productId: prod3.productId,
      sku: 'STR-RUN-BLK-9',
      color: 'Black',
      size: '9',
      storage: null,
      price: 3499.00,
      stockQuantity: 18,
      isActive: true,
      createdAt: now,
    };
    this.productVariants.push(v3_1, v3_2);

    // Product 4: Database Systems
    const prod4: Product = {
      productId: this.getNextProductId(),
      categoryId: catBooks.categoryId,
      name: 'Database Systems',
      description: 'Introductory database management book',
      brand: 'TechPress',
      basePrice: 799.00,
      isActive: true,
      createdAt: now,
    };
    this.products.push(prod4);

    const v4_1: ProductVariant = {
      variantId: this.getNextVariantId(),
      productId: prod4.productId,
      sku: 'DBMS-BOOK-STD',
      color: null,
      size: null,
      storage: null,
      price: 799.00,
      stockQuantity: 30,
      isActive: true,
      createdAt: now,
    };
    this.productVariants.push(v4_1);

    // Product 5: Laptop Backpack
    const prod5: Product = {
      productId: this.getNextProductId(),
      categoryId: catAccessories.categoryId,
      name: 'Laptop Backpack',
      description: 'Water-resistant laptop backpack',
      brand: 'CarryPro',
      basePrice: 1499.00,
      isActive: true,
      createdAt: now,
    };
    this.products.push(prod5);

    const v5_1: ProductVariant = {
      variantId: this.getNextVariantId(),
      productId: prod5.productId,
      sku: 'CP-BAG-BLK',
      color: 'Black',
      size: null,
      storage: null,
      price: 1499.00,
      stockQuantity: 12,
      isActive: true,
      createdAt: now,
    };
    this.productVariants.push(v5_1);

    // ---- Additional catalog: Products 6 - 32 ----

    // Electronics
    this.addProduct(catElectronics.categoryId, 'Wireless Bluetooth Earbuds', 'SoundMax',
      'True wireless earbuds with touch controls, deep bass and a fast-charging pocket case offering up to 30 hours of playtime.',
      2999, [
      { sku: 'SMX-EB-BLK', color: 'Black', price: 2999, stockQuantity: 40 },
      { sku: 'SMX-EB-WHT', color: 'White', price: 2999, stockQuantity: 35 },
    ]);

    this.addProduct(catElectronics.categoryId, '4K Ultra HD Action Camera', 'PixelPro',
      'Rugged waterproof action camera that records crystal-clear 4K60 video with electronic image stabilization, ideal for travel, sports and vlogging.',
      12999, [
      { sku: 'PPX-CAM-BLK', color: 'Black', price: 12999, stockQuantity: 15 },
      { sku: 'PPX-CAM-SLV', color: 'Silver', price: 13499, stockQuantity: 10 },
    ]);

    this.addProduct(catElectronics.categoryId, 'RGB Gaming Mouse', 'GameForce',
      'Ergonomic 8-button gaming mouse with a 16,000 DPI optical sensor, customizable RGB lighting and programmable macros for competitive play.',
      1999, [
      { sku: 'GF-MSE-BLK', color: 'Black', price: 1999, stockQuantity: 45 },
      { sku: 'GF-MSE-RED', color: 'Red', price: 2099, stockQuantity: 25 },
    ]);

    this.addProduct(catElectronics.categoryId, 'Mechanical Gaming Keyboard', 'GameForce',
      'Tenkeyless mechanical keyboard with hot-swappable switches, per-key RGB backlighting and anti-ghosting for precision gaming.',
      4499, [
      { sku: 'GF-KBD-BLU', color: 'Black', storage: 'Blue Switch', price: 4499, stockQuantity: 20 },
      { sku: 'GF-KBD-RED', color: 'Black', storage: 'Red Switch', price: 4799, stockQuantity: 18 },
    ]);

    this.addProduct(catElectronics.categoryId, 'Portable Bluetooth Speaker', 'SoundMax',
      'IPX7 waterproof Bluetooth speaker with 360-degree sound, 12-hour battery life and a built-in microphone for hands-free calls.',
      2499, [
      { sku: 'SMX-SPK-BLK', color: 'Black', price: 2499, stockQuantity: 30 },
      { sku: 'SMX-SPK-BLU', color: 'Blue', price: 2499, stockQuantity: 22 },
    ]);

    this.addProduct(catElectronics.categoryId, 'Power Bank 20000mAh', 'VoltEdge',
      'High-capacity 20000mAh power bank with 22.5W fast charging, dual USB-A ports and a USB-C PD port to charge phones, tablets and more.',
      1899, [
      { sku: 'VE-PB20K-BLK', color: 'Black', price: 1899, stockQuantity: 50 },
    ]);

    this.addProduct(catElectronics.categoryId, '65W GaN Fast Charger', 'VoltEdge',
      'Compact GaN wall charger with two USB-C ports and one USB-A port, capable of fast-charging laptops, tablets and phones simultaneously.',
      1299, [
      { sku: 'VE-CHG65-WHT', color: 'White', price: 1299, stockQuantity: 60 },
    ]);

    this.addProduct(catElectronics.categoryId, '10.1" Android Tablet', 'TechTime',
      'Slim 10.1-inch Full HD tablet with an octa-core processor, 8MP rear camera and all-day battery for streaming, reading and browsing.',
      15999, [
      { sku: 'TT-TAB10-64', storage: '64GB WiFi', price: 15999, stockQuantity: 12 },
      { sku: 'TT-TAB10-128', storage: '128GB WiFi', price: 18499, stockQuantity: 8 },
    ]);

    this.addProduct(catElectronics.categoryId, 'Aluminum Laptop Stand', 'DeskMate',
      'Adjustable aluminum laptop stand with silicone grips and an open design for improved airflow and better posture while working.',
      999, [
      { sku: 'DM-STD-SLV', color: 'Silver', price: 999, stockQuantity: 35 },
      { sku: 'DM-STD-GRY', color: 'Space Gray', price: 1099, stockQuantity: 28 },
    ]);

    this.addProduct(catElectronics.categoryId, 'Fitness Tracker Band', 'TechTime',
      'Lightweight fitness band with heart-rate monitoring, sleep tracking, SpO2 sensor and 14-day battery life.',
      3499, [
      { sku: 'TT-FIT-BLK', color: 'Black', price: 3499, stockQuantity: 25 },
      { sku: 'TT-FIT-RSG', color: 'Rose Gold', price: 3699, stockQuantity: 15 },
    ]);

    // Shoes
    this.addProduct(catShoes.categoryId, 'Classic Casual Sneakers', 'Stride',
      'Everyday low-top sneakers with a cushioned foam midsole, breathable canvas upper and a grippy rubber outsole.',
      2799, [
      { sku: 'STR-CSL-WHT-8', color: 'White', size: '8', price: 2799, stockQuantity: 12 },
      { sku: 'STR-CSL-WHT-9', color: 'White', size: '9', price: 2799, stockQuantity: 14 },
      { sku: 'STR-CSL-WHT-10', color: 'White', size: '10', price: 2799, stockQuantity: 10 },
    ]);

    this.addProduct(catShoes.categoryId, 'Pro Basketball Shoes', 'Hoops',
      'High-top basketball shoes with ankle support, responsive cushioning and a herringbone traction pattern for quick cuts on court.',
      5999, [
      { sku: 'HPS-BB-RED-9', color: 'Red', size: '9', price: 5999, stockQuantity: 10 },
      { sku: 'HPS-BB-BLK-10', color: 'Black', size: '10', price: 6299, stockQuantity: 8 },
    ]);

    this.addProduct(catShoes.categoryId, 'Genuine Leather Oxford Shoes', 'UrbanStep',
      'Hand-finished genuine leather oxfords with a cushioned insole and stitched sole - a timeless choice for office and formal occasions.',
      4499, [
      { sku: 'USF-OXF-BRN-8', color: 'Brown', size: '8', price: 4499, stockQuantity: 9 },
      { sku: 'USF-OXF-BLK-9', color: 'Black', size: '9', price: 4699, stockQuantity: 11 },
    ]);

    this.addProduct(catShoes.categoryId, 'All-Terrain Hiking Boots', 'TrekLine',
      'Waterproof hiking boots with a high-traction lug outsole, padded collar and shock-absorbing midsole for challenging trails.',
      5499, [
      { sku: 'TKL-HIK-OLV-9', color: 'Olive', size: '9', price: 5499, stockQuantity: 7 },
      { sku: 'TKL-HIK-BLK-10', color: 'Black', size: '10', price: 5799, stockQuantity: 6 },
    ]);

    this.addProduct(catShoes.categoryId, 'Canvas Slip-On Loafers', 'StreetFeet',
      'Easy-wear canvas slip-ons with an elastic gore panel, memory-foam footbed and machine-washable upper.',
      1499, [
      { sku: 'SFT-SLP-NVY-8', color: 'Navy', size: '8', price: 1499, stockQuantity: 16 },
      { sku: 'SFT-SLP-NVY-9', color: 'Navy', size: '9', price: 1499, stockQuantity: 18 },
    ]);

    this.addProduct(catShoes.categoryId, 'Retro High-Top Sneakers', 'StreetFeet',
      'Iconic high-top sneakers with a vulcanized rubber sole, padded ankle collar and premium suede accents.',
      3299, [
      { sku: 'SFT-HIT-WHT-8', color: 'White', size: '8', price: 3299, stockQuantity: 11 },
      { sku: 'SFT-HIT-WHT-9', color: 'White', size: '9', price: 3299, stockQuantity: 13 },
      { sku: 'SFT-HIT-WHT-10', color: 'White', size: '10', price: 3399, stockQuantity: 9 },
    ]);

    // Books
    this.addProduct(catBooks.categoryId, 'Clean Code: Handbook of Agile Software Craftsmanship', 'TechPress',
      'A must-read for professional developers - learn to write readable, maintainable code through practical principles and real-world refactoring examples.',
      649, [
      { sku: 'TP-CCODE-PB', storage: 'Paperback', price: 649, stockQuantity: 40 },
      { sku: 'TP-CCODE-HC', storage: 'Hardcover', price: 999, stockQuantity: 15 },
    ]);

    this.addProduct(catBooks.categoryId, 'Introduction to Algorithms (4th Edition)', 'MIT Press',
      'The definitive algorithms textbook covering data structures, graph algorithms, dynamic programming and computational complexity with rigorous proofs.',
      1199, [
      { sku: 'MIT-ALGO-HC', storage: 'Hardcover', price: 1199, stockQuantity: 22 },
    ]);

    this.addProduct(catBooks.categoryId, 'The Great Gatsby (Collector\'s Edition)', 'PageTurner',
      'F. Scott Fitzgerald\'s classic novel of the Jazz Age, presented in a beautifully bound collector\'s edition with original illustrations.',
      299, [
      { sku: 'PT-GATSBY-PB', storage: 'Paperback', price: 299, stockQuantity: 55 },
    ]);

    this.addProduct(catBooks.categoryId, 'Atomic Habits', 'Penguin',
      'James Clear\'s transformative guide to building good habits, breaking bad ones and mastering the tiny behaviors that lead to remarkable results.',
      499, [
      { sku: 'PN-ATOM-PB', storage: 'Paperback', price: 499, stockQuantity: 60 },
      { sku: 'PN-ATOM-HC', storage: 'Hardcover', price: 799, stockQuantity: 20 },
    ]);

    this.addProduct(catBooks.categoryId, 'Hands-On Machine Learning Basics', 'ScholarPress',
      'A beginner-friendly introduction to machine learning concepts, linear regression, neural networks and practical Python implementations.',
      899, [
      { sku: 'SP-MLEARN-PB', storage: 'Paperback', price: 899, stockQuantity: 28 },
    ]);

    // Accessories
    this.addProduct(catAccessories.categoryId, 'Genuine Leather Bifold Wallet', 'UrbanEdge',
      'Hand-stitched full-grain leather bifold wallet with 8 card slots, two currency compartments and RFID-blocking technology.',
      899, [
      { sku: 'UE-WLT-BRN', color: 'Brown', price: 899, stockQuantity: 32 },
      { sku: 'UE-WLT-BLK', color: 'Black', price: 899, stockQuantity: 38 },
    ]);

    this.addProduct(catAccessories.categoryId, 'Polarized UV400 Sunglasses', 'SunShield',
      'Lightweight polarized sunglasses with UV400 protection, spring hinges and a scratch-resistant coating. Includes hard case and microfiber cloth.',
      1299, [
      { sku: 'SS-SUN-BLK', color: 'Matte Black', price: 1299, stockQuantity: 26 },
      { sku: 'SS-SUN-TRT', color: 'Tortoise', price: 1399, stockQuantity: 18 },
    ]);

    this.addProduct(catAccessories.categoryId, 'Weekender Travel Duffel Bag', 'CarryPro',
      'Water-resistant 40L duffel bag with a shoe compartment, multiple organizer pockets and a detachable shoulder strap - perfect cabin size.',
      2299, [
      { sku: 'CP-DUF-NVY', color: 'Navy', price: 2299, stockQuantity: 14 },
      { sku: 'CP-DUF-BLK', color: 'Black', price: 2299, stockQuantity: 16 },
    ]);

    this.addProduct(catAccessories.categoryId, 'Classic Analog Wrist Watch', 'ChronoLux',
      'Timeless analog wrist watch with a Japanese quartz movement, stainless steel mesh strap and sapphire-coated mineral glass. 5ATM water resistant.',
      3999, [
      { sku: 'CLX-WCH-SLV', color: 'Silver', price: 3999, stockQuantity: 13 },
      { sku: 'CLX-WCH-GLD', color: 'Gold', price: 4499, stockQuantity: 9 },
    ]);

    this.addProduct(catAccessories.categoryId, 'Clear Shockproof Phone Case', 'GuardFit',
      'Military-grade drop protection phone case with reinforced corners, raised camera lip and an anti-yellowing clear back.',
      499, [
      { sku: 'GF-CASE-CLR', color: 'Clear', price: 499, stockQuantity: 70 },
      { sku: 'GF-CASE-BLK', color: 'Matte Black', price: 499, stockQuantity: 65 },
    ]);

    this.addProduct(catAccessories.categoryId, 'Adjustable Baseball Cap', 'StreetFeet',
      'Six-panel cotton twill baseball cap with an adjustable metal buckle strap and pre-curved brim for everyday sun protection.',
      599, [
      { sku: 'SFT-CAP-NVY', color: 'Navy', price: 599, stockQuantity: 42 },
      { sku: 'SFT-CAP-RED', color: 'Red', price: 599, stockQuantity: 30 },
    ]);

    // ---- Extended catalog: Products 33 - 56 ----

    // Electronics
    this.addProduct(catElectronics.categoryId, 'Smart Wi-Fi LED Bulb', 'VoltEdge',
      '16-million-color smart bulb with warm-to-cool white tones, app and voice control, schedules and music sync. No hub required.',
      499, [
      { sku: 'VE-BULB-WHT', color: 'Daylight White', price: 499, stockQuantity: 80 },
      { sku: 'VE-BULB-RGB', color: 'RGB Color', price: 649, stockQuantity: 65 },
    ]);

    this.addProduct(catElectronics.categoryId, '15W Fast Wireless Charging Pad', 'VoltEdge',
      'Slim Qi-certified wireless charger with a soft silicone surface, case-friendly design and built-in foreign-object detection.',
      1499, [
      { sku: 'VE-WCHG-BLK', color: 'Black', price: 1499, stockQuantity: 45 },
    ]);

    this.addProduct(catElectronics.categoryId, '7-in-1 USB-C Hub', 'DeskMate',
      'Aluminum USB-C hub with 4K HDMI, 100W PD passthrough charging, two USB 3.0 ports and SD/microSD card readers.',
      2299, [
      { sku: 'DM-HUB-SLV', color: 'Silver', price: 2299, stockQuantity: 24 },
      { sku: 'DM-HUB-GRY', color: 'Space Gray', price: 2399, stockQuantity: 19 },
    ]);

    this.addProduct(catElectronics.categoryId, 'Full HD Streaming Webcam', 'PixelPro',
      '1080p60 webcam with auto-focus, dual noise-cancelling mics, a privacy shutter and low-light correction for crisp video calls.',
      1799, [
      { sku: 'PPX-CAM1080-BLK', color: 'Black', price: 1799, stockQuantity: 28 },
    ]);

    this.addProduct(catElectronics.categoryId, '6" Glare-Free E-Reader', 'TechTime',
      'Paper-like 300 ppi e-reader with adjustable warm light, weeks-long battery and 8GB of storage for thousands of books.',
      8999, [
      { sku: 'TT-ERDR-BLK', color: 'Black', price: 8999, stockQuantity: 11 },
    ]);

    this.addProduct(catElectronics.categoryId, 'Bluetooth Neckband Earphones', 'SoundMax',
      'Magnetic neckband earbuds with deep bass drivers, vibration alerts for calls and 20-hour battery life.',
      1299, [
      { sku: 'SMX-NB-BLK', color: 'Black', price: 1299, stockQuantity: 38 },
      { sku: 'SMX-NB-BLU', color: 'Blue', price: 1299, stockQuantity: 26 },
    ]);

    this.addProduct(catElectronics.categoryId, 'Smart Home Speaker Mini', 'PixelPro',
      'Compact smart speaker with rich 360-degree sound, voice assistant built-in and multi-room pairing.',
      4999, [
      { sku: 'PPX-SPK-CHR', color: 'Charcoal', price: 4999, stockQuantity: 17 },
      { sku: 'PPX-SPK-SND', color: 'Sand', price: 4999, stockQuantity: 12 },
    ]);

    this.addProduct(catElectronics.categoryId, 'Portable External SSD 1TB', 'VoltEdge',
      'Shock-resistant portable SSD with read speeds up to 1050MB/s over USB-C, in a pocket-sized metal shell.',
      6499, [
      { sku: 'VE-SSD1T-BLK', color: 'Black', price: 6499, stockQuantity: 14 },
    ]);

    // Shoes
    this.addProduct(catShoes.categoryId, 'Kids School Shoes', 'UrbanStep',
      'Durable lace-up school shoes with scuff-resistant leather, cushioned insoles and non-slip soles that pass every playground test.',
      999, [
      { sku: 'USF-KID-BLK-2', color: 'Black', size: '2', price: 999, stockQuantity: 20 },
      { sku: 'USF-KID-BLK-4', color: 'Black', size: '4', price: 999, stockQuantity: 22 },
    ]);

    this.addProduct(catShoes.categoryId, 'Weightlifting Training Shoes', 'GymPro',
      'Flat, wide-base training shoes with a locked-down midfoot strap and rope-guard sidewalls for lifting and HIIT sessions.',
      3499, [
      { sku: 'GPR-LFT-WHT-9', color: 'White', size: '9', price: 3499, stockQuantity: 10 },
      { sku: 'GPR-LFT-BLK-10', color: 'Black', size: '10', price: 3699, stockQuantity: 8 },
    ]);

    this.addProduct(catShoes.categoryId, 'Classic Ballet Flats', 'UrbanStep',
      'Flexible ballet flats with a memory-foam footbed, elasticated topline and foldable design that fits any handbag.',
      1999, [
      { sku: 'USF-BLT-BEG-8', color: 'Beige', size: '8', price: 1999, stockQuantity: 12 },
      { sku: 'USF-BLT-BLK-9', color: 'Black', size: '9', price: 1999, stockQuantity: 14 },
    ]);

    this.addProduct(catShoes.categoryId, 'Waterproof Rain Boots', 'TrekLine',
      'Cheerful matte rain boots with a cozy fleece lining, grip outsole and easy-clean finish for monsoon-ready style.',
      2799, [
      { sku: 'TKL-RAIN-YLW-8', color: 'Yellow', size: '8', price: 2799, stockQuantity: 9 },
      { sku: 'TKL-RAIN-OLV-9', color: 'Olive', size: '9', price: 2799, stockQuantity: 7 },
    ]);

    // Books
    this.addProduct(catBooks.categoryId, 'Sapiens: A Brief History of Humankind', 'Penguin',
      'Yuval Noah Harari explores how an insignificant ape became the ruler of planet Earth - history, science and storytelling at its best.',
      599, [
      { sku: 'PN-SAPIENS-PB', storage: 'Paperback', price: 599, stockQuantity: 48 },
      { sku: 'PN-SAPIENS-HC', storage: 'Hardcover', price: 899, stockQuantity: 16 },
    ]);

    this.addProduct(catBooks.categoryId, 'Design Patterns: Elements of Reusable OOP', 'TechPress',
      'The Gang of Four classic cataloging 23 essential object-oriented design patterns - the foundation of modern software architecture.',
      1099, [
      { sku: 'TP-DPAT-HC', storage: 'Hardcover', price: 1099, stockQuantity: 18 },
    ]);

    this.addProduct(catBooks.categoryId, 'The Alchemist (25th Anniversary)', 'PageTurner',
      'Paulo Coelho\'s masterpiece about Santiago, an Andalusian shepherd boy, and his journey to discover a treasure and his personal legend.',
      349, [
      { sku: 'PT-ALCHEM-PB', storage: 'Paperback', price: 349, stockQuantity: 70 },
    ]);

    this.addProduct(catBooks.categoryId, 'Deep Work: Rules for Focused Success', 'Penguin',
      'Cal Newport argues for the superpower of undistracted concentration - practical rules for producing at an elite level.',
      499, [
      { sku: 'PN-DWORK-PB', storage: 'Paperback', price: 499, stockQuantity: 40 },
      { sku: 'PN-DWORK-HC', storage: 'Hardcover', price: 749, stockQuantity: 12 },
    ]);

    // Accessories
    this.addProduct(catAccessories.categoryId, 'Reversible Leather Belt', 'UrbanEdge',
      'Full-grain leather belt that flips between classic brown and formal black, with a rotating brushed-metal buckle.',
      749, [
      { sku: 'UE-BLT-M', size: 'M', price: 749, stockQuantity: 30 },
      { sku: 'UE-BLT-L', size: 'L', price: 749, stockQuantity: 26 },
    ]);

    this.addProduct(catAccessories.categoryId, 'Padded Laptop Sleeve 14"', 'CarryPro',
      'Plush-lined neoprene sleeve with a water-repellent exterior and an accessory pocket for chargers and cables.',
      699, [
      { sku: 'CP-SLV-GRY', color: 'Gray', price: 699, stockQuantity: 34 },
      { sku: 'CP-SLV-NVY', color: 'Navy', price: 699, stockQuantity: 31 },
    ]);

    this.addProduct(catAccessories.categoryId, 'RFID Travel Passport Holder', 'UrbanEdge',
      'Vegan-leather travel wallet with slots for passports, cards, boarding passes and SIM tools - all RFID shielded.',
      599, [
      { sku: 'UE-PPT-TAN', color: 'Tan', price: 599, stockQuantity: 27 },
      { sku: 'UE-PPT-NVY', color: 'Navy', price: 599, stockQuantity: 25 },
    ]);

    this.addProduct(catAccessories.categoryId, 'Non-Slip Yoga Mat 6mm', 'FitFlex',
      'High-density yoga mat with alignment lines, dual-texture grip surfaces and a carry strap. Free of PVC and toxic plasticizers.',
      1299, [
      { sku: 'FF-YOG-PUR', color: 'Purple', price: 1299, stockQuantity: 21 },
      { sku: 'FF-YOG-TEAL', color: 'Teal', price: 1399, stockQuantity: 18 },
    ]);

    this.addProduct(catAccessories.categoryId, 'Insulated Steel Water Bottle 1L', 'HydroSip',
      'Double-walled vacuum bottle that keeps drinks cold for 24h or hot for 12h, with a leakproof flip lid and powder coating.',
      899, [
      { sku: 'HS-BTL-STL', color: 'Stainless', price: 899, stockQuantity: 44 },
      { sku: 'HS-BTL-MBLK', color: 'Matte Black', price: 949, stockQuantity: 39 },
    ]);

    this.addProduct(catAccessories.categoryId, 'Ribbed Knit Beanie Cap', 'StreetFeet',
      'Soft stretch-knit beanie with a folded cuff that keeps you warm without the itch. One size fits all.',
      449, [
      { sku: 'SFT-BNE-GRY', color: 'Heather Gray', price: 449, stockQuantity: 36 },
      { sku: 'SFT-BNE-MUS', color: 'Mustard', price: 449, stockQuantity: 24 },
    ]);

    this.addProduct(catAccessories.categoryId, 'Bamboo Desk Organizer', 'DeskMate',
      'Eco-friendly bamboo organizer with five compartments for pens, phones, notes and cables to keep your desk zen.',
      799, [
      { sku: 'DM-ORG-NAT', color: 'Natural Bamboo', price: 799, stockQuantity: 23 },
      { sku: 'DM-ORG-WAL', color: 'Walnut Finish', price: 899, stockQuantity: 17 },
    ]);

    this.addProduct(catAccessories.categoryId, 'Ceramic Coffee Mug Set of 2', 'HearthHome',
      'Hand-glazed stoneware mugs with a matte exterior, comfortable handle and a 320ml capacity for slow mornings.',
      649, [
        { sku: 'HH-MUG2-CRM', color: 'Cream & Sage', price: 649, stockQuantity: 29 },
      ]);

    // 6. Cart Items
    const cart1 = this.carts.find(c => c.userId === user1.userId);
    const cart2 = this.carts.find(c => c.userId === user2.userId);
    const cart3 = this.carts.find(c => c.userId === user3.userId);

    if (cart1) {
      this.cartItems.push(
        { cartItemId: this.getNextCartItemId(), cartId: cart1.cartId, variantId: v1_1.variantId, quantity: 1, createdAt: now, updatedAt: now },
        { cartItemId: this.getNextCartItemId(), cartId: cart1.cartId, variantId: v3_1.variantId, quantity: 2, createdAt: now, updatedAt: now }
      );
    }
    if (cart2) {
      this.cartItems.push(
        { cartItemId: this.getNextCartItemId(), cartId: cart2.cartId, variantId: v2_1.variantId, quantity: 1, createdAt: now, updatedAt: now }
      );
    }
    if (cart3) {
      this.cartItems.push(
        { cartItemId: this.getNextCartItemId(), cartId: cart3.cartId, variantId: v5_1.variantId, quantity: 1, createdAt: now, updatedAt: now }
      );
    }

    // 7. Orders
    const addr1 = this.addresses.find(a => a.userId === user1.userId && a.addressType === 'HOME');
    const addr3 = this.addresses.find(a => a.userId === user2.userId && a.addressType === 'HOME');

    if (addr1) {
      const order1: Order = {
        orderId: this.getNextOrderId(),
        userId: user1.userId,
        addressId: addr1.addressId,
        orderStatus: 'DELIVERED',
        totalAmount: 4999.00,
        orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      };
      this.orders.push(order1);

      this.orderItems.push({
        orderItemId: this.getNextOrderItemId(),
        orderId: order1.orderId,
        variantId: v1_1.variantId,
        productName: 'Wireless Headphones',
        price: 4999.00,
        quantity: 1,
        discount: 0.00,
        totalPrice: 4999.00,
      });

      this.payments.push({
        paymentId: this.getNextPaymentId(),
        orderId: order1.orderId,
        paymentMethod: 'UPI',
        amount: 4999.00,
        paymentStatus: 'SUCCESS',
        transactionId: 'TXN-DEMO-1001',
        paymentDate: order1.orderDate,
      });
    }

    if (addr3) {
      const order2: Order = {
        orderId: this.getNextOrderId(),
        userId: user2.userId,
        addressId: addr3.addressId,
        orderStatus: 'CONFIRMED',
        totalAmount: 8999.00,
        orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      };
      this.orders.push(order2);

      this.orderItems.push({
        orderItemId: this.getNextOrderItemId(),
        orderId: order2.orderId,
        variantId: v2_1.variantId,
        productName: 'Smart Watch',
        price: 8999.00,
        quantity: 1,
        discount: 0.00,
        totalPrice: 8999.00,
      });

      this.payments.push({
        paymentId: this.getNextPaymentId(),
        orderId: order2.orderId,
        paymentMethod: 'CARD',
        amount: 8999.00,
        paymentStatus: 'SUCCESS',
        transactionId: 'TXN-DEMO-1002',
        paymentDate: order2.orderDate,
      });
    }

    // 8. Reviews
    this.reviews.push(
      {
        reviewId: this.getNextReviewId(),
        userId: user1.userId,
        productId: prod1.productId,
        rating: 5,
        reviewText: 'Good sound quality and comfortable.',
        reviewDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        reviewId: this.getNextReviewId(),
        userId: user2.userId,
        productId: prod2.productId,
        rating: 4,
        reviewText: 'Useful smartwatch with good battery life.',
        reviewDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      }
    );
  }
}

export const memoryStorage = new MemoryStorage();