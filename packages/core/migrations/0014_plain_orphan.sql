ALTER TABLE "user_invitations" DROP CONSTRAINT "user_invitations_verification_id_verifications_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_invitations" ADD CONSTRAINT "user_invitations_verification_id_verifications_id_fk" FOREIGN KEY ("verification_id") REFERENCES "public"."verifications"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
