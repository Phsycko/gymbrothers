/**
 * Server-side check for Postgres URL. Used before any db/lucia operation that would throw.
 */
export function normalizeDatabaseUrl(raw: string | undefined): string {
	if (!raw) {
		return "";
	}
	return raw.trim().replace(/^["']|["']$/g, "");
}

export function isDatabaseConfigured(): boolean {
	return normalizeDatabaseUrl(process.env.DATABASE_URL).length > 0;
}

/** Shown in UI when login/signup runs without DATABASE_URL. */
export const DATABASE_URL_MISSING_MESSAGE =
	"Database not connected. Copy .env.example to .env.local, set DATABASE_URL, then restart the dev server (npm run dev).";

/** Shown when Neon handshake / query fails (network, SSL, invalid URL, etc.). */
export const DATABASE_CONNECTION_ERROR = "Database Connection Error";
