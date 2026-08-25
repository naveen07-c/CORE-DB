// ================================================================================
// DOMAIN ENTITIES & INTERFACES (11 RELATIONAL TABLES) - ECOMMERCE_DB SCHEMA
// ================================================================================

export interface User {
  userId: number;
  fullName: string;
  email: string;
  password: string;
  phone?: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface Category {
  categoryId: number;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
}

export type AddressType = 'HOME' | 'OFFICE' | 'OTHER';

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
  createdAt: Date;
}

export interface Product {
  productId: number;
  categoryId: number;
  name: string;
  description?: string | null;
  brand?: string | null;
  basePrice: number;
  isActive: boolean;
  createdAt: Date;
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

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  orderId: number;
  userId: number;
  addressId: number;
  orderStatus: OrderStatus;
  totalAmount: number;
  orderDate: Date;
}

export interface OrderItem {
  orderItemId: number;
  orderId: number;
  variantId: number;
  productName: string;
  price: number;
  quantity: number;
  discount: number;
  totalPrice: number;
}

export type PaymentMethod = 'UPI' | 'CARD' | 'COD' | 'NET_BANKING';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface Payment {
  paymentId: number;
  orderId: number;
  paymentMethod: PaymentMethod;
  amount: number;
  paymentStatus: PaymentStatus;
  transactionId?: string | null;
  paymentDate: Date;
}

export interface Review {
  reviewId: number;
  userId: number;
  productId: number;
  rating: number;
  reviewText?: string | null;
  reviewDate: Date;
}

// ================================================================================
// DTOs & API CONTRACTS
// ================================================================================

export interface JWTPayload {
  userId: number;
  email: string;
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
  }>;
}

export interface CheckoutResult {
  orderId: number;
  transactionId: string;
  statusCode: string;
  message: string;
}