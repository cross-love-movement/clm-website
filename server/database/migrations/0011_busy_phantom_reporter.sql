ALTER TABLE "volunteer_opportunities" DROP CONSTRAINT "volunteer_opportunities_programme_id_programmes_id_fk";
--> statement-breakpoint
ALTER TABLE "volunteer_opportunities" ALTER COLUMN "programme_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "volunteer_opportunities" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "volunteer_opportunities" ADD CONSTRAINT "volunteer_opportunities_programme_id_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."programmes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "opportunities_status_deleted_idx" ON "volunteer_opportunities" USING btree ("status","deleted_at");