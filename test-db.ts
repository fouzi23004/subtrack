import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

console.log('Environment variables:');
console.log('SQL_HOST:', process.env.SQL_HOST);
console.log('SQL_USER:', process.env.SQL_USER);
console.log('SQL_PASSWORD:', process.env.SQL_PASSWORD ? '***' : 'UNDEFINED');
console.log('SQL_DB_NAME:', process.env.SQL_DB_NAME);

const pool = new Pool({
  host: process.env.SQL_HOST || 'localhost',
  user: process.env.SQL_USER || 'subtrack_user',
  password: process.env.SQL_PASSWORD || 'subtrack_password',
  database: process.env.SQL_DB_NAME || 'subtrack',
});

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
