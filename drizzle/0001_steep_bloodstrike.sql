CREATE TABLE "revendeurs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "entreprises" ADD COLUMN "revendeur_id" integer;--> statement-breakpoint
ALTER TABLE "revendeurs" ADD CONSTRAINT "revendeurs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entreprises" ADD CONSTRAINT "entreprises_revendeur_id_revendeurs_id_fk" FOREIGN KEY ("revendeur_id") REFERENCES "public"."revendeurs"("id") ON DELETE no action ON UPDATE no action;