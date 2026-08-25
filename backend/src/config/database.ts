import mysql from 'mysql2/promise';
import { ENV } from './env';

// Create a connection pool for MySQL 8.0
export const pool = mysql.createPool({
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  user: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  decimalNumbers: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: {
        rejectUnauthorized: false
      }

});

export const testDbConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (err) {
    return false;
  }
};
