DROP TABLE "payments";--> statement-breakpoint
DROP TABLE "subscriptions";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "has_access" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_price_id" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_stripe_customer_id_index" ON "users" USING btree ("stripe_customer_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_stripe_customer_id_unique" UNIQUE("stripe_customer_id");