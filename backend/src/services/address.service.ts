import { addressRepository } from '../repositories';
import { Address, AddressType } from '../types';

export class AddressService {
  async getAddresses(userId: number): Promise<Address[]> {
    return addressRepository.findByUserId(userId);
  }

  async createAddress(userId: number, data: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    addressType?: AddressType;
    isDefault?: boolean;
  }): Promise<Address> {
    return addressRepository.create({
      userId,
      fullName: data.fullName,
      phone: data.phone,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2 || null,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      addressType: data.addressType || 'HOME',
      isDefault: data.isDefault || false,
    });
  }

  async deleteAddress(userId: number, addressId: number): Promise<boolean> {
    return addressRepository.delete(addressId, userId);
  }

  async setDefaultAddress(userId: number, addressId: number): Promise<boolean> {
    return addressRepository.setDefault(addressId, userId);
  }
}

export const addressService = new AddressService();
