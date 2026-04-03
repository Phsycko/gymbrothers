-- Opción B: si `npm run db:migrate` no puede ejecutarse, pega esto en Neon → SQL Editor.
-- Opción A recomendada: desde la carpeta del proyecto con .env.local: npm run db:migrate

DO $announcement_category$ BEGIN
  CREATE TYPE "public"."announcement_category" AS ENUM ('event', 'maintenance', 'promotion');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $announcement_category$;

DO $announcement_priority$ BEGIN
  CREATE TYPE "public"."announcement_priority" AS ENUM ('low', 'medium', 'high');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $announcement_priority$;

CREATE TABLE IF NOT EXISTS "public"."announcements" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" varchar(255) NOT NULL,
  "content" text NOT NULL,
  "priority" "announcement_priority" NOT NULL,
  "category" "announcement_category" NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "announcements_created_at_idx" ON "public"."announcements" ("created_at");
