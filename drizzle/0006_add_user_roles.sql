-- Add role column to users table
ALTER TABLE "users" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;
--> statement-breakpoint
-- Update admin user to have admin role
UPDATE "users" SET "role" = 'admin' WHERE "email" = 'admin@subtrack.com';
