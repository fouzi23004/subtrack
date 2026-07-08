import dotenv from 'dotenv';
dotenv.config();

import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  host: process.env.SQL_HOST || 'localhost',
  user: process.env.SQL_USER || 'subtrack_user',
  password: process.env.SQL_PASSWORD || 'subtrack_password',
  database: process.env.SQL_DB_NAME || 'subtrack',
  port: parseInt(process.env.SQL_PORT || '5432'),
});

async function applyMigration() {
  const client = await pool.connect();

  try {
    console.log('Applying migration 0004_dazzling_blue_marvel.sql...');

    // Read the migration file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'drizzle', '0004_dazzling_blue_marvel.sql'),
      'utf8'
    );

    // Split by statement-breakpoint and execute each statement
    const statements = migrationSQL
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 100) + '...');
      await client.query(statement);
    }

    console.log('Migration applied successfully!');
  } catch (error) {
    console.error('Error applying migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

applyMigration().catch(console.error);
