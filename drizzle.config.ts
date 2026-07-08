import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: process.env.DATABASE_URL
    ? {
        url: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.SQL_HOST || 'localhost',
        user: process.env.SQL_USER || 'subtrack_user',
        password: process.env.SQL_PASSWORD || 'subtrack_password',
        database: process.env.SQL_DB_NAME || 'subtrack',
      },
});
