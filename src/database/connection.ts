import { Pool, PoolClient } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'document_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'changeme',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
});

export const initializeDatabase = async (): Promise<void> => {
  let client: PoolClient | null = null;
  try {
    client = await pool.connect();

    // Check if tables exist
    const result = await client.query(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'question_bank'
      )`
    );

    if (!result.rows[0].exists) {
      console.log('📋 Creating database schema...');

      const schema = fs.readFileSync(
        path.join(__dirname, 'schema.sql'),
        'utf-8'
      );

      await client.query(schema);
      console.log('✅ Schema created successfully');
    } else {
      console.log('✅ Schema already exists');
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  } finally {
    if (client) client.release();
  }
};

export const query = async (
  text: string,
  params?: any[]
): Promise<any> => {
  return pool.query(text, params);
};

export const getPool = (): Pool => pool;

export default pool;
