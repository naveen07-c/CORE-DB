import {
  IUserRepository,
  IAddressRepository,
  ICatalogRepository,
  ICartRepository,
  IOrderRepository,
  IReviewRepository,
} from './interfaces';
import { MemoryUserRepository } from './memory/userRepository';
import { MemoryAddressRepository } from './memory/addressRepository';
import { MemoryCatalogRepository } from './memory/catalogRepository';
import { MemoryCartRepository } from './memory/cartRepository';
import { MemoryOrderRepository } from './memory/orderRepository';
import { MemoryReviewRepository } from './memory/reviewRepository';
import { ENV } from '../config/env';

// Repository instances
export const userRepository: IUserRepository = new MemoryUserRepository();
export const addressRepository: IAddressRepository = new MemoryAddressRepository();
export const catalogRepository: ICatalogRepository = new MemoryCatalogRepository();
export const cartRepository: ICartRepository = new MemoryCartRepository();
export const orderRepository: IOrderRepository = new MemoryOrderRepository();
export const reviewRepository: IReviewRepository = new MemoryReviewRepository();

export * from './interfaces';
