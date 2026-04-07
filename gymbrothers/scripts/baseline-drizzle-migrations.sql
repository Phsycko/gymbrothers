-- =============================================================================
-- BASELINE: tu base ya tenía el esquema de 0000 + 0001 (p. ej. drizzle-kit push),
-- pero drizzle.__drizzle_migrations estaba vacía → `npm run db:migrate` re-ejecutaba
-- 0000 y fallaba con "type member_status already exists".
--
-- Pasos:
-- 1) Pega y ejecuta TODO este archivo en Neon → SQL Editor (una vez).
-- 2) En la terminal del proyecto: npm run db:migrate
--    → solo aplicará 0002_announcements.sql (tabla announcements).
--
-- Los hashes son SHA-256 del contenido exacto de cada archivo en drizzle/*.sql
-- (igual que drizzle-orm). Si editas una migración antigua, regenera hashes con:
--   node -e "const fs=require('fs');const c=require('crypto');console.log(c.createHash('sha256').update(fs.readFileSync('drizzle/0000_faithful_skin.sql','utf8')).digest('hex'))"
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS drizzle;

CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
	id SERIAL PRIMARY KEY,
	hash text NOT NULL,
	created_at bigint
);

-- 0000_faithful_skin.sql (journal when: 1775174791543)
INSERT INTO drizzle.__drizzle_migrations ("hash", "created_at")
VALUES (
	'5045ee75e70691de741f77977c2c5ed8683fae80bbfe70e951cf3a77e40ee07c',
	1775174791543
);

-- 0001_dazzling_smasher.sql (journal when: 1775177157234)
INSERT INTO drizzle.__drizzle_migrations ("hash", "created_at")
VALUES (
	'6692ed2899390febe8590317bd514efac8346082dfb3cc1a9d2c202dcdc780d6',
	1775177157234
);

-- Si ya aplicaste announcements a mano (p. ej. scripts/apply-announcements.sql) y NO quieres
-- volver a ejecutar 0002, descomenta y ejecuta también esto para que migrate no intente 0002:
-- INSERT INTO drizzle.__drizzle_migrations ("hash", "created_at")
-- VALUES (
-- 	'da82c7cd80af8cf87b2cff77d6abcdb0a4c9a6f70a528d415122050033ed2556',
-- 	1775186470553
-- );
