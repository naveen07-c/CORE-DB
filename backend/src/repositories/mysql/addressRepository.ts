import { pool } from '../../config/database';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IAddressRepository } from '../interfaces';
import { Address, AddressType } from '../../types';

interface AddressRow extends RowDataPacket {
  address_id: number;
  user_id: number;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  address_type: AddressType;
  created_at: Date;
}

const mapRow = (r: AddressRow): Address => ({
  addressId: r.address_id,
  userId: r.user_id,
  fullName: r.full_name,
  phone: r.phone,
  addressLine1: r.address_line1,
  addressLine2: r.address_line2,
  city: r.city,
  state: r.state,
  pincode: r.pincode,
  addressType: r.address_type,
  createdAt: new Date(r.created_at),
});

export class MySqlAddressRepository implements IAddressRepository {
  async findByUserId(userId: number): Promise<Address[]> {
    const [rows] = await pool.query<AddressRow[]>(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY address_id',
      [userId]
    );
    return rows.map(mapRow);
  }

  async findById(addressId: number): Promise<Address | null> {
    const [rows] = await pool.query<AddressRow[]>(
      'SELECT * FROM addresses WHERE address_id = ?',
      [addressId]
    );
    return rows.length > 0 ? mapRow(rows[0]) : null;
  }

  async create(addressData: Omit<Address, 'addressId' | 'createdAt'>): Promise<Address> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO addresses
       (user_id, full_name, phone, address_line1, address_line2, city, state, pincode, address_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        addressData.userId,
        addressData.fullName,
        addressData.phone,
        addressData.addressLine1,
        addressData.addressLine2 ?? null,
        addressData.city,
        addressData.state,
        addressData.pincode,
        addressData.addressType,
      ]
    );
    const created = await this.findById(result.insertId);
    return created!;
  }

  async delete(addressId: number, userId: number): Promise<boolean> {
    // Check if orders reference this address (ON DELETE RESTRICT)
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS cnt FROM orders WHERE address_id = ?',
      [addressId]
    );
    if (Number(rows[0].cnt) > 0) {
      throw new Error('FOREIGN KEY RESTRICTION: Address is linked to historical orders.');
    }
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM addresses WHERE address_id = ? AND user_id = ?',
      [addressId, userId]
    );
    return result.affectedRows > 0;
  }
}
