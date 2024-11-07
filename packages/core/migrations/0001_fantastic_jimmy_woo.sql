ALTER TABLE "membership" RENAME COLUMN "membership_body_id" TO "membership_body_name";--> statement-breakpoint
ALTER TABLE "membership" DROP CONSTRAINT "membership_job_seeker_id_membership_body_id_unique";--> statement-breakpoint
ALTER TABLE "membership" DROP CONSTRAINT "membership_membership_body_id_membership_bodies_id_fk";
