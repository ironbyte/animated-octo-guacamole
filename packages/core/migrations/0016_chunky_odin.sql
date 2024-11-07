ALTER TABLE "education" DROP CONSTRAINT "education_job_seeker_id_job_seeker_id_fk";
--> statement-breakpoint
ALTER TABLE "availability_slots" DROP CONSTRAINT "availability_slots_job_seeker_id_job_seeker_id_fk";
--> statement-breakpoint
ALTER TABLE "job_seeker_questions" DROP CONSTRAINT "job_seeker_questions_job_seeker_id_job_seeker_id_fk";
--> statement-breakpoint
ALTER TABLE "job_seeker_skill" DROP CONSTRAINT "job_seeker_skill_job_seeker_id_job_seeker_id_fk";
--> statement-breakpoint
ALTER TABLE "membership" DROP CONSTRAINT "membership_job_seeker_id_job_seeker_id_fk";
--> statement-breakpoint
ALTER TABLE "professional_certification" DROP CONSTRAINT "professional_certification_job_seeker_id_job_seeker_id_fk";
--> statement-breakpoint
ALTER TABLE "seagoing_experience" DROP CONSTRAINT "seagoing_experience_job_seeker_id_job_seeker_id_fk";
--> statement-breakpoint
ALTER TABLE "target_company" DROP CONSTRAINT "target_company_job_seeker_id_job_seeker_id_fk";
--> statement-breakpoint
ALTER TABLE "publications" DROP CONSTRAINT "publications_job_seeker_id_job_seeker_id_fk";
--> statement-breakpoint
ALTER TABLE "work_experience" DROP CONSTRAINT "work_experience_job_seeker_id_job_seeker_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "education" ADD CONSTRAINT "education_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_seeker_questions" ADD CONSTRAINT "job_seeker_questions_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_seeker_skill" ADD CONSTRAINT "job_seeker_skill_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "membership" ADD CONSTRAINT "membership_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "professional_certification" ADD CONSTRAINT "professional_certification_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "seagoing_experience" ADD CONSTRAINT "seagoing_experience_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "target_company" ADD CONSTRAINT "target_company_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "publications" ADD CONSTRAINT "publications_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "work_experience" ADD CONSTRAINT "work_experience_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_job_seeker_id_unique" UNIQUE("job_seeker_id");