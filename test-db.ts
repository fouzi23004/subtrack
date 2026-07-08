import dotenv from 'dotenv';
dotenv.config();

import { createPool } from './src/db/index';

const pool = createPool();

async function test() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection successful!', result.rows[0]);
    await pool.end();
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

test();
