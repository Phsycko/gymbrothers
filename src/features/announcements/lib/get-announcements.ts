import { desc } from "drizzle-orm";

import { db } from "@/server/db/client";
import type { Announcement } from "@/server/db/schema/gym-schema";
import { announcements } from "@/server/db/schema/gym-schema";

export type AnnouncementsQueryResult = {
	announcements: Announcement[];
	/** True when the `announcements` table is not in the DB yet (run migrations). */
	missingTable: boolean;
};

function isMissingAnnouncementsTableError(err: unknown): boolean {
	let cur: unknown = err;
	for (let i = 0; i < 5 && cur != null; i++) {
		if (typeof cur === "object" && cur !== null && "code" in cur) {
			const code = (cur as { code?: string }).code;
			if (code === "42P01") {
				return true;
			}
		}
		cur =
			typeof cur === "object" && cur !== null && "cause" in cur
				? (cur as { cause?: unknown }).cause
				: undefined;
	}
	const msg = err instanceof Error ? err.message : String(err);
	return (
		/relation\s+"announcements"\s+does\s+not\s+exist/i.test(msg) ||
		(msg.includes("announcements") && msg.includes("does not exist"))
	);
}

/**
 * Global feed — newest first. Reusable for Member View later.
 * If migrations were not applied, returns empty list and `missingTable: true` (no crash).
 */
export async function getAnnouncements(): Promise<AnnouncementsQueryResult> {
	try {
		const rows = await db
			.select()
			.from(announcements)
			.orderBy(desc(announcements.createdAt));
		return { announcements: rows, missingTable: false };
	} catch (err) {
		if (isMissingAnnouncementsTableError(err)) {
			if (process.env.NODE_ENV === "development") {
				console.warn(
					"[getAnnouncements] Tabla `announcements` ausente. Ejecuta: npm run db:migrate (o scripts/apply-announcements.sql en Neon).",
				);
			}
			return { announcements: [], missingTable: true };
		}
		throw err;
	}
}
