INSERT INTO "volunteer_needs" ("opportunity_id", "programme_id", "places", "created_at", "updated_at")
SELECT "opportunity_id", "programme_id", "places", "created_at", "updated_at"
FROM "programme_roles";--> statement-breakpoint
UPDATE "volunteer_assignments" AS "a"
SET "need_id" = "n"."id"
FROM "volunteer_needs" AS "n"
WHERE "a"."programme_id" = "n"."programme_id"
  AND "a"."opportunity_id" = "n"."opportunity_id"
  AND "a"."need_id" IS NULL;--> statement-breakpoint
UPDATE "volunteer_applications" AS "a"
SET "need_id" = "n"."id"
FROM "volunteer_needs" AS "n"
WHERE "a"."programme_id" = "n"."programme_id"
  AND "a"."opportunity_id" = "n"."opportunity_id"
  AND "a"."need_id" IS NULL;--> statement-breakpoint
DROP TABLE "programme_roles" CASCADE;
