import { IUserRepository } from '../interfaces';
import { User } from '../../types';
import { memoryStorage } from './memoryStorage';

export class MemoryUserRepository implements IUserRepository {
  async findById(userId: number): Promise<User | null> {
    const user = memoryStorage.users.find((u) => u.userId === userId && u.isActive);
    return user ? { ...user } : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = memoryStorage.users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.isActive);
    return user ? { ...user } : null;
  }

  async create(userData: Omit<User, 'userId' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date();
    const newUser: User = {
      userId: memoryStorage.getNextUserId(),
      ...userData,
      createdAt: now,
      updatedAt: now,
    };
    memoryStorage.users.push(newUser);

    // Relational rule: automatically initialize a 1:1 cart entity for new user
    memoryStorage.carts.push({
      cartId: memoryStorage.getNextCartId(),
      userId: newUser.userId,
      createdAt: now,
      updatedAt: now,
    });

    return { ...newUser };
  }

  async update(userId: number, updates: Partial<User>): Promise<User | null> {
    const index = memoryStorage.users.findIndex((u) => u.userId === userId);
    if (index === -1) return null;

    memoryStorage.users[index] = {
      ...memoryStorage.users[index],
      ...updates,
      updatedAt: new Date(),
    };
    return { ...memoryStorage.users[index] };
  }

  async delete(userId: number): Promise<boolean> {
    const userIndex = memoryStorage.users.findIndex((u) => u.userId === userId);
    if (userIndex === -1) return false;

    // Check RESTRICT on orders: if user has historical orders, restrict delete
    const hasOrders = memoryStorage.orders.some((o) => o.userId === userId);
    if (hasOrders) {
      throw new Error('FOREIGN KEY RESTRICTION: Cannot delete user with existing orders.');
    }

    // Cascade deletion of addresses
    memoryStorage.addresses = memoryStorage.addresses.filter((a) => a.userId !== userId);

    // Cascade deletion of cart and cart_items
    const userCart = memoryStorage.carts.find((c) => c.userId === userId);
    if (userCart) {
      memoryStorage.cartItems = memoryStorage.cartItems.filter((ci) => ci.cartId !== userCart.cartId);
      memoryStorage.carts = memoryStorage.carts.filter((c) => c.userId !== userId);
    }

    // Cascade deletion of user reviews
    memoryStorage.reviews = memoryStorage.reviews.filter((r) => r.userId !== userId);

    memoryStorage.users.splice(userIndex, 1);
    return true;
  }
}
