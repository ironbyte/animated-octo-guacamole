DO $$ BEGIN
 CREATE TYPE "public"."review_section" AS ENUM('Academy', 'Culture', 'CV_Publications', 'Experience', 'Screening', 'Video_Resume');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."review_status" AS ENUM('Pending', 'Approved', 'Rejected', 'Needs_Review');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "moderator_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"job_seeker_id" text NOT NULL,
	"moderator_id" text NOT NULL,
	"section" "review_section" NOT NULL,
	"status" "review_status" DEFAULT 'Pending' NOT NULL,
	"comments" varchar(400),
	"reviewed_at" timestamp,
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "moderator_reviews" ADD CONSTRAINT "moderator_reviews_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "moderator_reviews" ADD CONSTRAINT "moderator_reviews_moderator_id_users_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
