DO $$ BEGIN
 CREATE TYPE "public"."placement_area" AS ENUM('Freight_Forwarding', 'Warehousing', 'Chartering_Commercial', 'Chartering_Operations', 'Shipbroking', 'Ship_Management', 'Customer_Service', 'Documentation', 'Pricing', 'Sales');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."rating_type" AS ENUM('Good', 'Average', 'Unsatisfactory');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "moderator_evaluations" (
	"id" text PRIMARY KEY NOT NULL,
	"job_seeker_id" text NOT NULL,
	"moderator_id" text NOT NULL,
	"communication" "rating_type" NOT NULL,
	"presentation" "rating_type" NOT NULL,
	"industry_knowledge" "rating_type" NOT NULL,
	"areas_of_placement" placement_area[] NOT NULL,
	"general_comments" text,
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3),
	CONSTRAINT "moderator_evaluations_job_seeker_id_moderator_id_unique" UNIQUE("job_seeker_id","moderator_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "moderator_evaluations" ADD CONSTRAINT "moderator_evaluations_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "moderator_evaluations" ADD CONSTRAINT "moderator_evaluations_moderator_id_users_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
