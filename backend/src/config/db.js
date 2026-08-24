import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Create PostgreSQL connection pool
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/farmer_procurement';

export const pool = new Pool({
  connectionString,
  // Fallback to separate parameters if individual env vars exist
  host: process.env.PGHOST,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  max: 20, // Max 20 concurrent connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

/**
 * Execute parameterized query with automatic client management
 * @param {string} text - SQL query string with $1, $2 placeholders
 * @param {Array} params - Array of parameter values
 */
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      // console.log(`[SQL Query]`, { text: text.slice(0, 80), duration: `${duration}ms`, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error(`[SQL Error] ${error.message}`, { query: text, params });
    throw error;
  }
};

/**
 * Helper to run a callback inside an atomic transaction
 * @param {Function} callback - Async function taking client parameter
 */
export const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Verify PostgreSQL connection status
 */
export const connectDB = async () => {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() as current_time, current_database() as db_name');
    client.release();
    console.log(`[PostgreSQL] Connected Successfully to '${res.rows[0].db_name}' at ${res.rows[0].current_time}`);
    return true;
  } catch (error) {
    console.warn(`[PostgreSQL Connection Notice] ${error.message}`);
    console.warn(`Tip: Ensure PostgreSQL is running and DATABASE_URL is configured in .env (e.g. postgresql://postgres:password@localhost:5432/farmer_procurement).`);
    return false;
  }
};

export default {
  pool,
  query,
  withTransaction,
  connectDB,
};
