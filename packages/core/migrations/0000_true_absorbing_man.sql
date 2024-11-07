DO $$ BEGIN
 CREATE TYPE "public"."education_level" AS ENUM('Postgraduate', 'Graduate', 'Diploma');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."emirates_prefs" AS ENUM('Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."people_management_experience" AS ENUM('5+ years', '1-5 years', 'No experience');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."seaRank" AS ENUM('Chief Officer', 'Chief Engineer', '2nd Officer', '2nd Engineer', '3rd Officer', '3rd Engineer', '4th Engineer', 'Cadet', 'Radio Officer');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."skill" AS ENUM('Chartering', 'Ship broking', 'Post-fixture', 'Commercial managers', 'Technical managers', 'Crewing', 'Bunkering', 'Ship Chandling', 'Stevedoring', 'Customs clearance', 'Port agents', 'Container Line', 'NVOCC', 'Freight Forwarder', 'Project cargo / Break-bulk', 'Cruise industry', 'Manufacturing', 'Trading', 'Road Transport', 'Warehousing', 'Oil / Chemicals Terminal', 'Container Terminal', 'Port', 'Back office', 'Customer Service', 'IT solutions', 'Legal', 'Finance', 'Training / Teaching', 'Consultancy');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."organization_type" AS ENUM('company', 'individual');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."org_role" AS ENUM('owner', 'recruiter', 'member');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('admin', 'job_seeker', 'org_member');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."job_type" AS ENUM('Internship', 'Consultant', 'Part-time', 'Full-time');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "companies" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3),
	CONSTRAINT "companies_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "countries" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" text NOT NULL,
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3),
	CONSTRAINT "countries_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "education" (
	"id" text PRIMARY KEY NOT NULL,
	"job_seeker_id" text NOT NULL,
	"education_level" "education_level" NOT NULL,
	"institution" text,
	"degree_name" text,
	"field_of_study" text,
	"education_start_year" integer,
	"education_end_year" integer,
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_applications" (
	"id" text PRIMARY KEY NOT NULL,
	"job_posting_id" text NOT NULL,
	"candidate_id" text NOT NULL,
	"status" text NOT NULL,
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_postings" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"created_by" text NOT NULL,
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_seeker" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"total_years_experience" integer,
	"arabic_speaking" boolean,
	"dubai_trade_portal" boolean,
	"uae_customs" boolean,
	"free_zone_process" boolean,
	"personal_website_url" text,
	"available_from" timestamp,
	"cv_file_s3_key" text,
	"cv_file_name" text,
	"cv_uploaded_at" timestamp,
	"video_cv_url" text,
	"emirates_prefs" emirates_prefs[] DEFAULT '{}'::emirates_prefs[],
	"people_management_experience" "people_management_experience" DEFAULT 'No experience' NOT NULL,
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3),
	CONSTRAINT "job_seeker_id_unique" UNIQUE("id"),
	CONSTRAINT "job_seeker_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_seeker_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"job_seeker_id" text NOT NULL,
	"next_job_seek" text,
	"motivation" text,
	"work_environment" text,
	"top_values_in_next_job" jsonb,
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3),
	CONSTRAINT "job_seeker_questions_job_seeker_id_unique" UNIQUE("job_seeker_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_seeker_skill" (
	"id" text PRIMARY KEY NOT NULL,
	"job_seeker_id" text,
	"skill" "skill" NOT NULL,
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3),
	CONSTRAINT "job_seeker_skill_job_seeker_id_skill_unique" UNIQUE("job_seeker_id","skill")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "membership" (
	"id" text PRIMARY KEY NOT NULL,
	"job_seeker_id" text NOT NULL,
	"membership_body_id" text NOT NULL,
	"year_of_joining" integer NOT NULL,
	"membership_certificate" text NOT NULL,
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3),
	CONSTRAINT "membership_job_seeker_id_membership_body_id_unique" UNIQUE("job_seeker_id","membership_body_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "professional_certification" (
	"id" text PRIMARY KEY NOT NULL,
	"job_seeker_id" text NOT NULL,
	"institute" text NOT NULL,
	"certification_name" text NOT NULL,
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "seagoing_experience" (
	"id" text PRIMARY KEY NOT NULL,
	"job_seeker_id" text NOT NULL,
	"sea_rank" "seaRank" NOT NULL,
	"total_years_sea_going_experience" integer,
	CONSTRAINT "seagoing_experience_job_seeker_id_unique" UNIQUE("job_seeker_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "target_company" (
	"id" text PRIMARY KEY NOT NULL,
	"job_seeker_id" text,
	"company_id" text NOT NULL,
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3),
	CONSTRAINT "target_company_job_seeker_id_company_id_unique" UNIQUE("job_seeker_id","company_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "membership_bodies" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3),
	CONSTRAINT "membership_bodies_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "organization_type" NOT NULL,
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "publications" (
	"id" text PRIMARY KEY NOT NULL,
	"job_seeker_id" text NOT NULL,
	"publication_link" text,
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "passwords" (
	"user_id" text PRIMARY KEY NOT NULL,
	"hash" varchar(255) NOT NULL,
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"role" "org_role" NOT NULL,
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3),
	CONSTRAINT "user_organizations_user_id_organization_id_unique" UNIQUE("user_id","organization_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"mobile" varchar(20) NOT NULL,
	"linkedin_url" text,
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"last_activity_at" timestamp DEFAULT now(),
	"ip_address" varchar(45),
	"user_agent" varchar(255),
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"is_verified" boolean DEFAULT false,
	"is_onboarded" boolean DEFAULT false,
	"role" "user_role" DEFAULT 'job_seeker' NOT NULL,
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"secret" text NOT NULL,
	"target" text NOT NULL,
	"period" integer NOT NULL,
	"algorithm" text NOT NULL,
	"digits" integer NOT NULL,
	"expires_at" timestamp,
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3),
	CONSTRAINT "verifications_target_type_unique" UNIQUE("target","type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "work_experience" (
	"id" text PRIMARY KEY NOT NULL,
	"job_seeker_id" text NOT NULL,
	"company" text NOT NULL,
	"location" text,
	"state" text,
	"country_id" text NOT NULL,
	"role" text NOT NULL,
	"measurable_achievements" text NOT NULL,
	"work_start_year" integer NOT NULL,
	"work_end_year" integer,
	"job_type" "job_type" NOT NULL,
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "education" ADD CONSTRAINT "education_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_posting_id_job_postings_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_postings"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_candidate_id_users_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_seeker" ADD CONSTRAINT "job_seeker_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_seeker_questions" ADD CONSTRAINT "job_seeker_questions_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_seeker_skill" ADD CONSTRAINT "job_seeker_skill_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "membership" ADD CONSTRAINT "membership_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "membership" ADD CONSTRAINT "membership_membership_body_id_membership_bodies_id_fk" FOREIGN KEY ("membership_body_id") REFERENCES "public"."membership_bodies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "professional_certification" ADD CONSTRAINT "professional_certification_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "seagoing_experience" ADD CONSTRAINT "seagoing_experience_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "target_company" ADD CONSTRAINT "target_company_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "target_company" ADD CONSTRAINT "target_company_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "publications" ADD CONSTRAINT "publications_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "passwords" ADD CONSTRAINT "passwords_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_organizations" ADD CONSTRAINT "user_organizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_organizations" ADD CONSTRAINT "user_organizations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "work_experience" ADD CONSTRAINT "work_experience_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "work_experience" ADD CONSTRAINT "work_experience_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_sessions_user_id_index" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_sessions_expires_at_index" ON "user_sessions" USING btree ("expires_at");