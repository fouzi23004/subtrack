import { drizzle } from 'drizzle-orm/node-postgres';
import * as dotenv from 'dotenv';
import { users } from './src/db/schema';
import { hashPassword } from './src/lib/auth';
import { eq } from 'drizzle-orm';
import { createPool } from './src/db/index';

dotenv.config();

async function createAdmin() {
  const pool = createPool();

  const db = drizzle(pool);

  const adminEmail = 'admin@subtrack.com';
  const adminPassword = 'admin123456'; // Change this to a secure password

  console.log('Creating admin account...');
  console.log('Email:', adminEmail);
  console.log('Password:', adminPassword);
  console.log('');

  // Check if admin already exists
  const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);

  if (existingAdmin.length > 0) {
    console.log('❌ Admin account already exists!');
    console.log('Admin ID:', existingAdmin[0].id);
    console.log('Admin Email:', existingAdmin[0].email);
    await pool.end();
    return;
  }

  // Hash the password
  const hashedPassword = await hashPassword(adminPassword);

  // Create admin user
  const result = await db.insert(users).values({
    email: adminEmail,
    password: hashedPassword,
    role: 'admin',
  }).returning();

  console.log('✅ Admin account created successfully!');
  console.log('');
  console.log('Admin Details:');
  console.log('─────────────────────────────');
  console.log('ID:', result[0].id);
  console.log('Email:', result[0].email);
  console.log('Password:', adminPassword);
  console.log('Created:', result[0].createdAt);
  console.log('─────────────────────────────');
  console.log('');
  console.log('⚠️  IMPORTANT: Change the admin password after first login!');

  await pool.end();
}

createAdmin().catch((err) => {
  console.error('❌ Failed to create admin account:', err);
  process.exit(1);
});
