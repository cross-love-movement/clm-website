CREATE TYPE "public"."assignment_status" AS ENUM('planned', 'active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."background_check_status" AS ENUM('not_required', 'pending', 'cleared', 'failed');--> statement-breakpoint
CREATE TYPE "public"."opportunity_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."programme_status" AS ENUM('planned', 'active', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."programme_type" AS ENUM('cmp', 'yep', 'cross-sessions', 'symposium', 'outreach', 'other');--> statement-breakpoint
CREATE TYPE "public"."volunteer_status" AS ENUM('applied', 'screening', 'approved', 'invited', 'active', 'paused', 'declined', 'withdrawn', 'alumni');--> statement-breakpoint
CREATE TABLE "programmes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"type" "programme_type" DEFAULT 'other' NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"content_path" text DEFAULT '' NOT NULL,
	"status" "programme_status" DEFAULT 'planned' NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"coordinator_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programmes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "volunteer_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"volunteer_id" uuid NOT NULL,
	"programme_id" uuid,
	"opportunity_id" uuid,
	"area" text DEFAULT '' NOT NULL,
	"availability" text DEFAULT '' NOT NULL,
	"experience" text DEFAULT '' NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"consent_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "volunteer_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"volunteer_id" uuid NOT NULL,
	"programme_id" uuid NOT NULL,
	"opportunity_id" uuid,
	"role_title" text DEFAULT '' NOT NULL,
	"status" "assignment_status" DEFAULT 'planned' NOT NULL,
	"starts_on" date,
	"ends_on" date,
	"notes" text DEFAULT '' NOT NULL,
	"assigned_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "volunteer_opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"programme_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"commitment" text DEFAULT '' NOT NULL,
	"requirements" text[] DEFAULT '{}'::text[] NOT NULL,
	"slots" integer,
	"location" text DEFAULT '' NOT NULL,
	"status" "opportunity_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "opportunity_slots_non_negative" CHECK ("volunteer_opportunities"."slots" is null or "volunteer_opportunities"."slots" >= 0)
);
--> statement-breakpoint
CREATE TABLE "volunteers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"city" text DEFAULT '' NOT NULL,
	"skills" text[] DEFAULT '{}'::text[] NOT NULL,
	"availability" text DEFAULT '' NOT NULL,
	"experience" text DEFAULT '' NOT NULL,
	"status" "volunteer_status" DEFAULT 'applied' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"emergency_contact_name" text DEFAULT '' NOT NULL,
	"emergency_contact_phone" text DEFAULT '' NOT NULL,
	"date_of_birth" date,
	"safeguarding_consent_at" timestamp with time zone,
	"safeguarding_briefing_at" timestamp with time zone,
	"background_check_status" "background_check_status" DEFAULT 'not_required' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "volunteers_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "volunteers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "programmes" ADD CONSTRAINT "programmes_coordinator_id_users_id_fk" FOREIGN KEY ("coordinator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_applications" ADD CONSTRAINT "volunteer_applications_volunteer_id_volunteers_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."volunteers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_applications" ADD CONSTRAINT "volunteer_applications_programme_id_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."programmes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_applications" ADD CONSTRAINT "volunteer_applications_opportunity_id_volunteer_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."volunteer_opportunities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_assignments" ADD CONSTRAINT "volunteer_assignments_volunteer_id_volunteers_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."volunteers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_assignments" ADD CONSTRAINT "volunteer_assignments_programme_id_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."programmes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_assignments" ADD CONSTRAINT "volunteer_assignments_opportunity_id_volunteer_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."volunteer_opportunities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_assignments" ADD CONSTRAINT "volunteer_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_opportunities" ADD CONSTRAINT "volunteer_opportunities_programme_id_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."programmes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "programmes_status_starts_idx" ON "programmes" USING btree ("status","starts_at");--> statement-breakpoint
CREATE INDEX "applications_volunteer_idx" ON "volunteer_applications" USING btree ("volunteer_id","created_at");--> statement-breakpoint
CREATE INDEX "assignments_volunteer_status_idx" ON "volunteer_assignments" USING btree ("volunteer_id","status");--> statement-breakpoint
CREATE INDEX "assignments_programme_status_idx" ON "volunteer_assignments" USING btree ("programme_id","status");--> statement-breakpoint
CREATE INDEX "opportunities_programme_status_idx" ON "volunteer_opportunities" USING btree ("programme_id","status");--> statement-breakpoint
CREATE INDEX "volunteers_status_idx" ON "volunteers" USING btree ("status","created_at");--> statement-breakpoint
UPDATE "users" SET "permissions" = ARRAY(SELECT DISTINCT unnest("permissions" || ARRAY['canManageVolunteers', 'canManageProgrammes']::text[])) WHERE "role" = 'admin';