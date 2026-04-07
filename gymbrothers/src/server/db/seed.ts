import { resolve } from "node:path";
/**
 * One-shot seed: creates the initial owner account for local/staging bootstrap.
 * In production, set SEED_ADMIN_PASSWORD explicitly (never commit it).
 */
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import { hashPassword } from "../../lib/auth/password";
import { normalizeDatabaseUrl } from "./env";
import * as authSchema from "./schema/auth-schema";
import * as gymSchema from "./schema/gym-schema";
import { users } from "./schema/gym-schema";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const ADMIN_EMAIL = "admin@gymbrothers.com";

const schema = { ...gymSchema, ...authSchema };

function resolveSeedPassword(): string | null {
	const fromEnv = process.env.SEED_ADMIN_PASSWORD?.trim();
	if (fromEnv && fromEnv.length >= 8) {
		return fromEnv;
	}
	if (fromEnv && fromEnv.length > 0 && fromEnv.length < 8) {
		console.error("❌ SEED_ADMIN_PASSWORD must be at least 8 characters.");
		return null;
	}
	if (process.env.NODE_ENV === "production") {
		console.error(
			"❌ SEED_ADMIN_PASSWORD is required in production (no default password).",
		);
		return null;
	}
	console.warn(
		"⚠️  SEED_ADMIN_PASSWORD not set — using local dev default. Set SEED_ADMIN_PASSWORD before production.",
	);
	return "admin123";
}

async function main(): Promise<void> {
	const url = normalizeDatabaseUrl(process.env.DATABASE_URL);
	if (!url || url.length === 0) {
		console.error(
			"❌ DATABASE_URL is missing. Set it in .env.local (see .env.example).",
		);
		process.exitCode = 1;
		return;
	}

	const passwordPlain = resolveSeedPassword();
	if (!passwordPlain) {
		process.exitCode = 1;
		return;
	}

	const sql = neon(url);
	const db = drizzle(sql, { schema });

	try {
		const existing = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, ADMIN_EMAIL))
			.limit(1);

		if (existing.length > 0) {
			console.log(`ℹ️  User ${ADMIN_EMAIL} already exists — nothing to do.`);
			return;
		}

		const hashedPassword = await hashPassword(passwordPlain);

		await db.insert(users).values({
			username: "admin",
			email: ADMIN_EMAIL,
			hashedPassword,
			passwordIsDefault: false,
			role: "owner",
		});

		console.log(`✅ Seeded owner account: usuario admin · ${ADMIN_EMAIL}`);
		console.log(
			"🔐 Entra en /login con usuario admin y la contraseña de seed, luego rota credenciales.",
		);
	} catch (err) {
		console.error("❌ Seed failed:", err);
		process.exitCode = 1;
	} finally {
		console.log("📪 Neon HTTP session finished.");
	}
}

void main();
