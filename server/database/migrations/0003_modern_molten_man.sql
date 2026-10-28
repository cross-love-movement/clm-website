ALTER TABLE "users" ADD COLUMN "permissions" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
UPDATE "users" SET "permissions" = ARRAY['canEdit', 'canManageRegistrations', 'canManagePeople']::text[] WHERE "role" = 'admin';--> statement-breakpoint
UPDATE "users" SET "permissions" = ARRAY['canEdit', 'canManageRegistrations']::text[] WHERE "role" = 'editor';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
UPDATE "users" SET "role" = CASE "role"
  WHEN 'editor' THEN 'admin'
  WHEN 'viewer' THEN 'admin'
  WHEN 'member' THEN 'volunteer'
  ELSE "role"
END;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'volunteer'::text;--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('superadmin', 'admin', 'volunteer');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'volunteer'::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";
