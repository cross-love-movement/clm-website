CREATE TABLE "programme_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"programme_id" uuid NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"places" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programme_role_places_non_negative" CHECK ("programme_roles"."places" is null or "programme_roles"."places" >= 0)
);
--> statement-breakpoint
ALTER TABLE "volunteer_opportunities" DROP CONSTRAINT "opportunity_slots_non_negative";--> statement-breakpoint
ALTER TABLE "volunteer_opportunities" DROP CONSTRAINT "volunteer_opportunities_programme_id_programmes_id_fk";
--> statement-breakpoint
DROP INDEX "opportunities_programme_status_idx";--> statement-breakpoint
ALTER TABLE "programme_roles" ADD CONSTRAINT "programme_roles_programme_id_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."programmes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_roles" ADD CONSTRAINT "programme_roles_opportunity_id_volunteer_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."volunteer_opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "programme_roles_pair_idx" ON "programme_roles" USING btree ("programme_id","opportunity_id");--> statement-breakpoint
CREATE INDEX "programme_roles_opportunity_idx" ON "programme_roles" USING btree ("opportunity_id");--> statement-breakpoint
INSERT INTO "programme_roles" ("programme_id", "opportunity_id", "places")
SELECT "programme_id", "id", "slots"
FROM "volunteer_opportunities"
WHERE "programme_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "volunteer_opportunities" DROP COLUMN "programme_id";--> statement-breakpoint
ALTER TABLE "volunteer_opportunities" DROP COLUMN "slots";