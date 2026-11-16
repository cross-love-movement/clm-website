CREATE TABLE "volunteer_needs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"programme_id" uuid,
	"event_id" uuid,
	"places" integer,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "volunteer_need_places_non_negative" CHECK ("volunteer_needs"."places" is null or "volunteer_needs"."places" >= 0),
	CONSTRAINT "volunteer_need_single_container" CHECK (num_nonnulls("volunteer_needs"."programme_id", "volunteer_needs"."event_id") <= 1),
	CONSTRAINT "volunteer_need_has_container" CHECK (num_nonnulls("volunteer_needs"."programme_id", "volunteer_needs"."event_id") = 1)
);
--> statement-breakpoint
ALTER TABLE "volunteer_assignments" ALTER COLUMN "programme_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "volunteer_applications" ADD COLUMN "event_id" uuid;--> statement-breakpoint
ALTER TABLE "volunteer_applications" ADD COLUMN "need_id" uuid;--> statement-breakpoint
ALTER TABLE "volunteer_assignments" ADD COLUMN "event_id" uuid;--> statement-breakpoint
ALTER TABLE "volunteer_assignments" ADD COLUMN "need_id" uuid;--> statement-breakpoint
ALTER TABLE "volunteer_needs" ADD CONSTRAINT "volunteer_needs_opportunity_id_volunteer_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."volunteer_opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_needs" ADD CONSTRAINT "volunteer_needs_programme_id_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."programmes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_needs" ADD CONSTRAINT "volunteer_needs_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "volunteer_needs_programme_idx" ON "volunteer_needs" USING btree ("programme_id");--> statement-breakpoint
CREATE INDEX "volunteer_needs_event_idx" ON "volunteer_needs" USING btree ("event_id");--> statement-breakpoint
ALTER TABLE "volunteer_applications" ADD CONSTRAINT "volunteer_applications_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_applications" ADD CONSTRAINT "volunteer_applications_need_id_volunteer_needs_id_fk" FOREIGN KEY ("need_id") REFERENCES "public"."volunteer_needs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_assignments" ADD CONSTRAINT "volunteer_assignments_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_assignments" ADD CONSTRAINT "volunteer_assignments_need_id_volunteer_needs_id_fk" FOREIGN KEY ("need_id") REFERENCES "public"."volunteer_needs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assignments_event_status_idx" ON "volunteer_assignments" USING btree ("event_id","status");--> statement-breakpoint
ALTER TABLE "volunteer_assignments" ADD CONSTRAINT "assignment_single_container" CHECK (num_nonnulls("volunteer_assignments"."programme_id", "volunteer_assignments"."event_id") = 1);