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
import { MySqlUserRepository } from './mysql/userRepository';
import { MySqlAddressRepository } from './mysql/addressRepository';
import { MySqlCatalogRepository } from './mysql/catalogRepository';
import { MySqlCartRepository } from './mysql/cartRepository';
import { MySqlOrderRepository } from './mysql/orderRepository';
import { MySqlReviewRepository } from './mysql/reviewRepository';
import { ENV } from '../config/env';

// Repository factory: DATA_SOURCE=mysql persists to ecommerce_db (ACID),
// anything else uses the in-memory seed store.
const useMysql = ENV.DATA_SOURCE.trim().toLowerCase() === 'mysql';

// Repository instances
export const userRepository: IUserRepository = useMysql ? new MySqlUserRepository() : new MemoryUserRepository();
export const addressRepository: IAddressRepository = useMysql ? new MySqlAddressRepository() : new MemoryAddressRepository();
export const catalogRepository: ICatalogRepository = useMysql ? new MySqlCatalogRepository() : new MemoryCatalogRepository();
export const cartRepository: ICartRepository = useMysql ? new MySqlCartRepository() : new MemoryCartRepository();
export const orderRepository: IOrderRepository = useMysql ? new MySqlOrderRepository() : new MemoryOrderRepository();
export const reviewRepository: IReviewRepository = useMysql ? new MySqlReviewRepository() : new MemoryReviewRepository();

export * from './interfaces';
