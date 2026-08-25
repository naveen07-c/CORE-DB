import { pool } from '../../config/database';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IUserRepository } from '../interfaces';
import { User } from '../../types';

interface UserRow extends RowDataPacket {
  user_id: number;
  full_name: string;
  email: string;
  password: string;
  phone: string | null;
  created_at: Date;
  is_active: boolean | number;
}

const mapRow = (r: UserRow): User => ({
  userId: r.user_id,
  fullName: r.full_name,
  email: r.email,
  password: r.password,
  phone: r.phone,
  isActive: Boolean(r.is_active),
  createdAt: new Date(r.created_at),
});

export class MySqlUserRepository implements IUserRepository {
  async findById(userId: number): Promise<User | null> {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT * FROM users WHERE user_id = ? AND is_active = TRUE',
      [userId]
    );
    return rows.length > 0 ? mapRow(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
      [email]
    );
    // Enforce case-insensitive match explicitly (parity with memory repo)
    const found = rows.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return found ? mapRow(found) : null;
  }

  async create(userData: Omit<User, 'userId' | 'createdAt'>): Promise<User> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.execute<ResultSetHeader>(
        `INSERT INTO users (full_name, email, password, phone, is_active)
         VALUES (?, ?, ?, ?, TRUE)`,
        [userData.fullName, userData.email, userData.password, userData.phone ?? null]
      );
      const userId = result.insertId;

      // Relational rule: automatically initialize a 1:1 cart entity for new user
      await conn.execute('INSERT INTO cart (user_id) VALUES (?)', [userId]);

      await conn.commit();
      const created = await this.findById(userId);
      return created!;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  async update(userId: number, updates: Partial<User>): Promise<User | null> {
    const allowed: Partial<Record<keyof User, string>> = {
      fullName: 'full_name',
      email: 'email',
      password: 'password',
      phone: 'phone',
      isActive: 'is_active',
    };
    const sets: string[] = [];
    const values: any[] = [];
    for (const [key, column] of Object.entries(allowed)) {
      if (updates[key as keyof User] !== undefined) {
        sets.push(`${column} = ?`);
        values.push(updates[key as keyof User]);
      }
    }
    if (sets.length === 0) return this.findById(userId);

    values.push(userId);
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE users SET ${sets.join(', ')} WHERE user_id = ?`,
      values
    );
    if (result.affectedRows === 0) return null;
    return this.findById(userId);
  }

  async delete(userId: number): Promise<boolean> {
    // Check RESTRICT on orders: if user has historical orders, restrict delete.
    // Otherwise cascades handle addresses / cart+cart_items / reviews.
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS cnt FROM orders WHERE user_id = ?',
      [userId]
    );
    if (Number(rows[0].cnt) > 0) {
      throw new Error('FOREIGN KEY RESTRICTION: Cannot delete user with existing orders.');
    }
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM users WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }
}
