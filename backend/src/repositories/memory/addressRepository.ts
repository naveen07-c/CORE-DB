import { IAddressRepository } from '../interfaces';
import { Address } from '../../types';
import { memoryStorage } from './memoryStorage';

export class MemoryAddressRepository implements IAddressRepository {
  async findByUserId(userId: number): Promise<Address[]> {
    return memoryStorage.addresses
      .filter((a) => a.userId === userId)
      .map((a) => ({ ...a }));
  }

  async findById(addressId: number): Promise<Address | null> {
    const address = memoryStorage.addresses.find((a) => a.addressId === addressId);
    return address ? { ...address } : null;
  }

  async create(addressData: Omit<Address, 'addressId' | 'createdAt'>): Promise<Address> {
    const newAddress: Address = {
      addressId: memoryStorage.getNextAddressId(),
      ...addressData,
      createdAt: new Date(),
    };

    memoryStorage.addresses.push(newAddress);
    return { ...newAddress };
  }

  async delete(addressId: number, userId: number): Promise<boolean> {
    const index = memoryStorage.addresses.findIndex((a) => a.addressId === addressId && a.userId === userId);
    if (index === -1) return false;

    // Check if orders reference this address (ON DELETE RESTRICT)
    const isUsedInOrders = memoryStorage.orders.some((o) => o.addressId === addressId);
    if (isUsedInOrders) {
      throw new Error('FOREIGN KEY RESTRICTION: Address is linked to historical orders.');
    }

    memoryStorage.addresses.splice(index, 1);
    return true;
  }

  async setDefault(addressId: number, userId: number): Promise<boolean> {
    // Not applicable in new schema - no isDefault field
    return false;
  }
}