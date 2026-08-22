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
  private nextOrderId = 1001;
  private nextOrderItemId = 5001;
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

  private seedInitialData() {
    const passwordHash = bcrypt.hashSync('Pass123!', 10);
    const now = new Date();

    // 1. Users (Admin + Customer)
    const adminUser: User = {
      userId: this.getNextUserId(),
      fullName: 'System Administrator',
      email: 'admin@vortex.com',
      passwordHash,
      phone: '9876543210',
      role: 'ADMIN',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    const customerUser: User = {
      userId: this.getNextUserId(),
      fullName: 'Jane Customer',
      email: 'customer@test.com',
      passwordHash,
      phone: '9123456780',
      role: 'CUSTOMER',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    this.users.push(adminUser, customerUser);

    // 2. Default Address for Customer
    const customerAddress: Address = {
      addressId: this.getNextAddressId(),
      userId: customerUser.userId,
      fullName: 'Jane Customer',
      phone: '9123456780',
      addressLine1: '404 Relational Drive, Suite 800',
      addressLine2: 'Tech Park Corridor',
      city: 'San Francisco',
      state: 'CA',
      pincode: '94107',
      addressType: 'HOME',
      isDefault: true,
      createdAt: now,
    };
    this.addresses.push(customerAddress);

    // 3. 1:1 Carts for Users
    this.carts.push(
      { cartId: this.getNextCartId(), userId: adminUser.userId, createdAt: now, updatedAt: now },
      { cartId: this.getNextCartId(), userId: customerUser.userId, createdAt: now, updatedAt: now }
    );

    // 4. Categories (3 Starter Categories)
    const catLaptops: Category = {
      categoryId: this.getNextCategoryId(),
      name: 'Laptops & Computers',
      slug: 'laptops-computers',
      description: 'High performance laptops, developer ultrabooks, and workstations.',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      createdAt: now,
    };
    const catPhones: Category = {
      categoryId: this.getNextCategoryId(),
      name: 'Smartphones & Tablets',
      slug: 'smartphones-tablets',
      description: 'Next-gen flagship mobile devices with high refresh OLED screens.',
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      createdAt: now,
    };
    const catAudio: Category = {
      categoryId: this.getNextCategoryId(),
      name: 'Audio & Wearables',
      slug: 'audio-wearables',
      description: 'Active Noise Cancelling headphones, audiophile monitors, and smart wearables.',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      createdAt: now,
    };
    this.categories.push(catLaptops, catPhones, catAudio);

    // 5. Products & Multi-Attribute Variants (Section 5.1 Starter Seed Data)
    
    // Product 1: ProBook 14X
    const prod1: Product = {
      productId: this.getNextProductId(),
      categoryId: catLaptops.categoryId,
      name: 'ProBook 14X',
      slug: 'probook-14x',
      brand: 'VORTEX Tech',
      description: 'Flagship engineering ultrabook featuring CNC aluminum unibody, Liquid Retina XDR display, and 18-hour battery longevity.',
      basePrice: 899.00,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    this.products.push(prod1);

    const v1_1: ProductVariant = {
      variantId: this.getNextVariantId(),
      productId: prod1.productId,
      sku: 'PB-14X-SG-16-512',
      color: 'Space Gray',
      size: '14-inch',
      storage: '16GB RAM / 512GB SSD',
      price: 899.00,
      stockQuantity: 15,
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      createdAt: now,
    };
    const v1_2: ProductVariant = {
      variantId: this.getNextVariantId(),
      productId: prod1.productId,
      sku: 'PB-14X-SL-32-1TB',
      color: 'Silver',
      size: '14-inch',
      storage: '32GB RAM / 1TB SSD',
      price: 1199.00,
      stockQuantity: 8,
      imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      createdAt: now,
    };
    this.productVariants.push(v1_1, v1_2);

    // Product 2: AeroPulse ANC Headphones
    const prod2: Product = {
      productId: this.getNextProductId(),
      categoryId: catAudio.categoryId,
      name: 'AeroPulse ANC Headphones',
      slug: 'aeropulse-anc-headphones',
      brand: 'AeroAcoustics',
      description: 'Studio-grade wireless over-ear headphones with 45dB hybrid active noise cancellation and lossless spatial audio.',
      basePrice: 199.00,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    this.products.push(prod2);

    const v2_1: ProductVariant = {
      variantId: this.getNextVariantId(),
      productId: prod2.productId,
      sku: 'AP-ANC-BLK',
      color: 'Matte Black',
      size: 'Over-Ear',
      storage: '40mm Titanium Drivers',
      price: 199.00,
      stockQuantity: 25,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      createdAt: now,
    };
    const v2_2: ProductVariant = {
      variantId: this.getNextVariantId(),
      productId: prod2.productId,
      sku: 'AP-ANC-WHT',
      color: 'Ivory White',
      size: 'Over-Ear',
      storage: '40mm Titanium Drivers',
      price: 199.00,
      stockQuantity: 12,
      imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      createdAt: now,
    };
    this.productVariants.push(v2_1, v2_2);

    // Product 3: Galaxy Pro S26
    const prod3: Product = {
      productId: this.getNextProductId(),
      categoryId: catPhones.categoryId,
      name: 'Galaxy Pro S26',
      slug: 'galaxy-pro-s26',
      brand: 'NovaTech',
      description: 'Flagship 5G smartphone equipped with 200MP computational camera, Snapdragon Gen 4 silicon, and Dynamic AMOLED 2X display.',
      basePrice: 799.00,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    this.products.push(prod3);

    const v3_1: ProductVariant = {
      variantId: this.getNextVariantId(),
      productId: prod3.productId,
      sku: 'GP-S26-BLK-128',
      color: 'Phantom Black',
      size: '6.7-inch AMOLED',
      storage: '128GB UFS 4.0',
      price: 799.00,
      stockQuantity: 20,
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      createdAt: now,
    };
    const v3_2: ProductVariant = {
      variantId: this.getNextVariantId(),
      productId: prod3.productId,
      sku: 'GP-S26-BLK-256',
      color: 'Phantom Black',
      size: '6.7-inch AMOLED',
      storage: '256GB UFS 4.0',
      price: 899.00,
      stockQuantity: 14,
      imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      createdAt: now,
    };
    this.productVariants.push(v3_1, v3_2);

    // 6. Initial Seed Reviews
    this.reviews.push({
      reviewId: this.getNextReviewId(),
      userId: customerUser.userId,
      productId: prod1.productId,
      rating: 5,
      title: 'Phenomenal Development Workstation',
      reviewText: 'The thermal performance and compiling speeds on the ProBook 14X are unbelievable. Build quality is top tier.',
      isVerified: true,
      reviewDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });
  }
}

export const memoryStorage = new MemoryStorage();
