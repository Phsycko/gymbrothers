CREATE TABLE "exercise_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exercise_requests" ADD CONSTRAINT "exercise_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "exercise_requests_created_at_idx" ON "exercise_requests" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "exercise_requests_user_id_idx" ON "exercise_requests" USING btree ("user_id");
