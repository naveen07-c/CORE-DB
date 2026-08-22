import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories';
import { ENV } from '../config/env';
import { User, JWTPayload, UserRole } from '../types';

export class AuthService {
  async register(data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    role?: UserRole;
  }): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      const err: any = new Error('An account with this email address already exists.');
      err.statusCode = 409;
      err.code = 'ERR_USER_EXISTS';
      throw err;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await userRepository.create({
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      phone: data.phone || null,
      role: data.role || 'CUSTOMER',
      isActive: true,
    });

    const token = this.generateToken(user);
    const { passwordHash: _, ...safeUser } = user;

    return { user: safeUser, token };
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
    const user = await userRepository.findByEmail(credentials.email);
    if (!user) {
      const err: any = new Error('Invalid email or password.');
      err.statusCode = 401;
      err.code = 'ERR_INVALID_CREDENTIALS';
      throw err;
    }

    const isMatch = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isMatch) {
      const err: any = new Error('Invalid email or password.');
      err.statusCode = 401;
      err.code = 'ERR_INVALID_CREDENTIALS';
      throw err;
    }

    const token = this.generateToken(user);
    const { passwordHash: _, ...safeUser } = user;

    return { user: safeUser, token };
  }

  generateToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.userId,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };
    return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: ENV.JWT_EXPIRES_IN as any });
  }
}

export const authService = new AuthService();
