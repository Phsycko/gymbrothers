ALTER TABLE "routines" ADD COLUMN "assigned_user_id" uuid;--> statement-breakpoint
ALTER TABLE "routines" ADD CONSTRAINT "routines_assigned_user_id_users_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "routines_assigned_user_id_idx" ON "routines" USING btree ("assigned_user_id");
