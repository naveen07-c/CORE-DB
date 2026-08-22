import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'vortex_super_secret_jwt_key_2026_antigravity_core_db',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '3306', 10),
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'vortex_commerce_db',
  DATA_SOURCE: process.env.DATA_SOURCE || 'memory',
};
