// ================================================================================
// DOMAIN ENTITIES & INTERFACES (11 RELATIONAL TABLES)
// ================================================================================

export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  userId: number;
  fullName: string;
  email: string;
  passwordHash: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  categoryId: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
}

export type AddressType = 'HOME' | 'WORK' | 'OTHER';

export interface Address {
  addressId: number;
  userId: number;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  addressType: AddressType;
  isDefault: boolean;
  createdAt: Date;
}

export interface Product {
  productId: number;
  categoryId: number;
  name: string;
  slug: string;
  brand: string;
  description: string;
  basePrice: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  variantId: number;
  productId: number;
  sku: string;
  color?: string | null;
  size?: string | null;
  storage?: string | null;
  price: number;
  stockQuantity: number;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface Cart {
  cartId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  cartItemId: number;
  cartId: number;
  variantId: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  orderId: number;
  userId: number;
  addressId: number;
  orderStatus: OrderStatus;
  subtotalAmount: number;
  taxAmount: number;
  shippingFee: number;
  totalAmount: number;
  orderDate: Date;
  updatedAt: Date;
}

export interface OrderItem {
  orderItemId: number;
  orderId: number;
  variantId: number;
  productName: string;      // Snapshot title
  variantDetails: string;   // Snapshot 'Color / Size / Storage'
  unitPrice: number;        // Snapshot price
  quantity: number;
  discount: number;
  totalPrice: number;
}

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'UPI' | 'NET_BANKING' | 'COD';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface Payment {
  paymentId: number;
  orderId: number;
  paymentMethod: PaymentMethod;
  amount: number;
  paymentStatus: PaymentStatus;
  transactionId: string;
  paymentDate: Date;
}

export interface Review {
  reviewId: number;
  userId: number;
  productId: number;
  rating: number; // 1-5
  title?: string | null;
  reviewText: string;
  isVerified: boolean;
  reviewDate: Date;
}

// ================================================================================
// DTOs & API CONTRACTS
// ================================================================================

export interface JWTPayload {
  userId: number;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
  details?: any;
}

export interface ProductDetailResponse extends Product {
  category: {
    categoryId: number;
    name: string;
    slug?: string;
  };
  variants: ProductVariant[];
  reviews: {
    averageRating: number;
    totalReviews: number;
    items: Array<Review & { userName: string }>;
  };
}

export interface CartResponse {
  cartId: number;
  itemCount: number;
  subtotal: number;
  items: Array<{
    cartItemId: number;
    variantId: number;
    productId: number;
    productName: string;
    sku: string;
    variantDetails: string;
    unitPrice: number;
    quantity: number;
    stockAvailable: number;
    totalPrice: number;
    imageUrl?: string | null;
  }>;
}

export interface CheckoutResult {
  orderId: number;
  transactionId: string;
  statusCode: string;
  message: string;
}
