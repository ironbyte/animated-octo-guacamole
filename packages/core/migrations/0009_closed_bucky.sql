ALTER TABLE "membership_bodies" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "membership_bodies" ALTER COLUMN "category" SET DATA TYPE varchar(100);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "membership_category_idx" ON "membership_bodies" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "membership_body_name_idx" ON "membership_bodies" USING btree ("name");