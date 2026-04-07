CREATE TABLE "equipment_damage_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"machine_name" varchar(120) NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "equipment_damage_reports" ADD CONSTRAINT "equipment_damage_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "equipment_damage_reports_created_at_idx" ON "equipment_damage_reports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "equipment_damage_reports_user_id_idx" ON "equipment_damage_reports" USING btree ("user_id");