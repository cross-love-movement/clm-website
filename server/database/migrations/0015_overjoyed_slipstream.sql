CREATE TYPE "public"."donation_frequency" AS ENUM('one_time', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."donation_status" AS ENUM('pending', 'succeeded', 'failed', 'abandoned', 'refunded');--> statement-breakpoint
CREATE TABLE "donation_plans" (
	"amount_pesewas" integer PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"currency" text DEFAULT 'GHS' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "donation_plans_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"status" "donation_status" DEFAULT 'pending' NOT NULL,
	"amount_pesewas" integer NOT NULL,
	"currency" text DEFAULT 'GHS' NOT NULL,
	"frequency" "donation_frequency" DEFAULT 'one_time' NOT NULL,
	"donor_name" text NOT NULL,
	"donor_email" text NOT NULL,
	"donor_phone" text DEFAULT '' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"channel" text,
	"plan_code" text,
	"customer_code" text,
	"subscription_code" text,
	"paid_at" timestamp with time zone,
	"receipt_sent_at" timestamp with time zone,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "donations_reference_unique" UNIQUE("reference"),
	CONSTRAINT "donation_amount_positive" CHECK ("donations"."amount_pesewas" > 0)
);
--> statement-breakpoint
CREATE INDEX "donations_status_created_idx" ON "donations" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "donations_email_idx" ON "donations" USING btree ("donor_email");