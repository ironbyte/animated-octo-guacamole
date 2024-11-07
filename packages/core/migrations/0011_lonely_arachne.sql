DO $$ BEGIN
 CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'declined', 'revoked');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"role" "user_role" NOT NULL,
	"sender_id" text NOT NULL,
	"status" "invitation_status" DEFAULT 'pending',
	"time_created" timestamp (3) DEFAULT now() NOT NULL,
	"time_updated" timestamp (3) DEFAULT now() NOT NULL,
	"time_deleted" timestamp (3),
	CONSTRAINT "user_invitations_email_role_unique" UNIQUE("email","role")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_invitations" ADD CONSTRAINT "user_invitations_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
