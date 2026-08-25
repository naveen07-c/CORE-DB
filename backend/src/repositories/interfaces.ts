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
  ProductDetailResponse,
  CartResponse,
  CheckoutResult,
} from '../types';

export interface IUserRepository {
  findById(userId: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, 'userId' | 'createdAt'>): Promise<User>;
  update(userId: number, updates: Partial<User>): Promise<User | null>;
  delete(userId: number): Promise<boolean>;
}

export interface IAddressRepository {
  findByUserId(userId: number): Promise<Address[]>;
  findById(addressId: number): Promise<Address | null>;
  create(address: Omit<Address, 'addressId' | 'createdAt'>): Promise<Address>;
  delete(addressId: number, userId: number): Promise<boolean>;
}

export interface ProductFilterParams {
  categoryId?: number;
  search?: string;
  brand?: string;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ICatalogRepository {
  getCategories(): Promise<Category[]>;
  getProducts(filters: ProductFilterParams): Promise<{ total: number; page: number; totalPages: number; data: any[] }>;
  getProductById(productId: number): Promise<ProductDetailResponse | null>;
  getVariantById(variantId: number): Promise<ProductVariant | null>;
  updateVariantPrice(variantId: number, newPrice: number): Promise<boolean>;
  updateVariantStock(variantId: number, newStock: number): Promise<boolean>;
}

export interface ICartRepository {
  getOrCreateCart(userId: number): Promise<Cart>;
  getCartByUserId(userId: number): Promise<CartResponse>;
  addItem(userId: number, variantId: number, quantity: number): Promise<void>;
  updateItemQuantity(userId: number, cartItemId: number, quantity: number): Promise<void>;
  removeItem(userId: number, cartItemId: number): Promise<void>;
  clearCart(userId: number): Promise<void>;
}

export interface IOrderRepository {
  executeCheckout(userId: number, addressId: number, paymentMethod: string, transactionId: string): Promise<CheckoutResult>;
  getOrdersByUserId(userId: number): Promise<any[]>;
  getOrderById(orderId: number, userId?: number): Promise<any | null>;
}

export interface IReviewRepository {
  createReview(review: Omit<Review, 'reviewId' | 'reviewDate'>): Promise<Review>;
  hasUserPurchasedProduct(userId: number, productId: number): Promise<boolean>;
  getReviewsByProductId(productId: number): Promise<Array<Review & { userName: string }>>;
}