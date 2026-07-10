CREATE TABLE "puce_plans" ("id" serial PRIMARY KEY NOT NULL, "name" text NOT NULL UNIQUE, "created_at" timestamp DEFAULT now());
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "plan" text;
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "phone_numbers" jsonb;
--> statement-breakpoint
INSERT INTO "puce_plans" ("name") VALUES ('simple'), ('gold'), ('2025');
