import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Migration runner: Reads schema.sql and runs all DDL statements
 */
export const runMigrations = async () => {
  console.log('=============================================');
  console.log('Running PostgreSQL Database Migrations...');
  console.log('=============================================');

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(schemaSql);
    await client.query('COMMIT');
    console.log('✓ All 8 Database Tables & Indexes created successfully!');
    console.log('Tables: admins, farmers, procurement_centres, procurement_slots, queues, procurement_records, payments, notifications');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('✗ Migration Failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

// If run directly from terminal: node src/database/migrate.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default runMigrations;
