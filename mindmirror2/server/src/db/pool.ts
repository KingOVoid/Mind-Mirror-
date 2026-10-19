import { Pool } from 'pg';
import { env } from '../config/env';

const useSsl =
  env.IS_PROD ||
  env.DATABASE_URL.includes('sslmode=require') ||
  env.DATABASE_URL.includes('neon.tech') ||
  env.DATABASE_URL.includes('supabase.co');

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  // Never log credentials/connection strings — only the error message.
  console.error('Unexpected database pool error:', err.message);
});

/**
 * Run a single query against the pool. Thin wrapper kept in one place so
 * every data-access call goes through the same logging/error path.
 */
export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  const result = await pool.query(text, params);
  return { rows: result.rows };
}

/**
 * Run a function inside a transaction. Commits on success, rolls back on throw.
 */
export async function withTransaction<T>(fn: (client: import('pg').PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
