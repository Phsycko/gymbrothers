CREATE TYPE "public"."announcement_category" AS ENUM('event', 'maintenance', 'promotion');--> statement-breakpoint
CREATE TYPE "public"."announcement_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"priority" "announcement_priority" NOT NULL,
	"category" "announcement_category" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "announcements_created_at_idx" ON "announcements" USING btree ("created_at");