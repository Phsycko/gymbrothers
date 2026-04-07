CREATE TYPE "public"."equipment_report_status" AS ENUM('open', 'in_progress', 'resolved');--> statement-breakpoint
ALTER TABLE "equipment_damage_reports" ADD COLUMN "status" "equipment_report_status" DEFAULT 'open' NOT NULL;--> statement-breakpoint
ALTER TABLE "equipment_damage_reports" ADD COLUMN "staff_note" text;--> statement-breakpoint
ALTER TABLE "equipment_damage_reports" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "equipment_damage_reports_status_idx" ON "equipment_damage_reports" USING btree ("status");