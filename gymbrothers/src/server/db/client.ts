import { Pool } from "@neondatabase/serverless";
import { type NeonDatabase, drizzle } from "drizzle-orm/neon-serverless";

import { normalizeDatabaseUrl } from "@/server/db/env";

import * as authSchema from "./schema/auth-schema";
import * as gymSchema from "./schema/gym-schema";

const schema = { ...gymSchema, ...authSchema };

type DbInstance = NeonDatabase<typeof schema>;

let pool: Pool | undefined;
let dbInstance: DbInstance | undefined;

function getDbInstance(): DbInstance {
	if (!dbInstance) {
		const url = normalizeDatabaseUrl(process.env.DATABASE_URL);
		if (!url) {
			throw new Error(
				"DATABASE_URL is not set. Add it to .env.local (see .env.example).",
			);
		}
		// Neon `Pool` (WebSocket) supports `db.transaction()`; `neon()` HTTP does not.
		pool = new Pool({ connectionString: url });
		dbInstance = drizzle(pool, { schema });
	}
	return dbInstance;
}

/**
 * Drizzle over Neon serverless `Pool` — transactions work (required for payment flow).
 * Singleton so Server Actions / RSC reuse one pool in a warm Node process.
 */
export const db = new Proxy({} as DbInstance, {
	get(_target, prop, receiver) {
		const real = getDbInstance();
		const value = Reflect.get(real, prop, receiver);
		if (typeof value === "function") {
			return value.bind(real);
		}
		return value;
	},
});
