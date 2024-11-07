DO $$ BEGIN
 CREATE TYPE "public"."assignment_status" AS ENUM('active', 'completed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "moderator_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"job_seeker_id" text NOT NULL,
	"moderator_id" text NOT NULL,
	"assigned_by" text NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"status" "assignment_status" DEFAULT 'active' NOT NULL,
	"ended_at" timestamp,
	"notes" text,
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "moderator_assignments" ADD CONSTRAINT "moderator_assignments_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "moderator_assignments" ADD CONSTRAINT "moderator_assignments_moderator_id_users_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "moderator_assignments" ADD CONSTRAINT "moderator_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
