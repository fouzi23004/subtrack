import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Function to create a new connection pool.
export const createPool = () => {
  const config = {
    host: process.env.SQL_HOST || 'localhost',
    user: process.env.SQL_USER || 'subtrack_user',
    password: process.env.SQL_PASSWORD || 'subtrack_password',
    database: process.env.SQL_DB_NAME || 'subtrack',
    connectionTimeoutMillis: 15000,
  };

  console.log('Creating database pool with:', {
    ...config,
    password: config.password ? '***' : 'UNDEFINED'
  });

  return new Pool(config);
};

// Create a pool instance lazily
let _pool: Pool | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getPool() {
  if (!_pool) {
    _pool = createPool();

    // Prevent unhandled pool-level errors from crashing the application
    _pool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return _pool;
}

// Initialize Drizzle with the pool and schema (lazily).
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(target, prop) {
    if (!_db) {
      _db = drizzle(getPool(), { schema });
    }
    return (_db as any)[prop];
  }
});
