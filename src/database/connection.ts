import { Pool, PoolClient } from 'pg';
import fs from 'fs';
import path from 'path';
import { mockDB } from './mockDb';

let usesMockDB = false;
let pool: Pool | null = null;

// Try to create connection pool, fall back to mock DB if PostgreSQL unavailable
const createPool = (): Pool => {
  return new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'document_ai',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'changeme',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
};

// Error handling will be set up in initializeDatabase

export const initializeDatabase = async (): Promise<void> => {
  try {
    // Try PostgreSQL first
    pool = createPool();
    let client: PoolClient | null = null;

    try {
      client = await pool.connect();
      client.release();
      console.log('✅ PostgreSQL connected');
    } catch (pgError) {
      console.log('⚠️  PostgreSQL not available, using in-memory database for development');
      usesMockDB = true;
      pool = null;
      await mockDB.initializeDatabase();
    }
  } catch (error) {
    console.log('⚠️  Using mock database for development');
    usesMockDB = true;
    await mockDB.initializeDatabase();
  }
};

export const query = async (
  text: string,
  params?: any[]
): Promise<any> => {
  if (usesMockDB || !pool) {
    return mockDB.query(text, params);
  }
  return pool.query(text, params);
};

export const getPool = (): Pool | null => pool;

export default pool;
