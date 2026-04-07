import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { resolve } from "node:path";

import { normalizeDatabaseUrl } from "./src/server/db/env";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

export default defineConfig({
	schema: [
		"./src/server/db/schema/gym-schema.ts",
		"./src/server/db/schema/auth-schema.ts",
	],
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		// Neon requires TLS; use the full URL from .env.local (include ?sslmode=require).
		url: normalizeDatabaseUrl(process.env.DATABASE_URL),
	},
	strict: true,
});
