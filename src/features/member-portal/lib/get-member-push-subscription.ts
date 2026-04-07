import { count, eq } from "drizzle-orm";

import { db } from "@/server/db/client";
import { pushSubscriptions } from "@/server/db/schema/gym-schema";

/**
 * True si el socio tiene al menos un endpoint de Web Push registrado.
 */
export async function getMemberHasPushSubscription(
	userId: string,
): Promise<boolean> {
	if (!userId) {
		return false;
	}
	const [row] = await db
		.select({ n: count() })
		.from(pushSubscriptions)
		.where(eq(pushSubscriptions.userId, userId));
	return Number(row?.n ?? 0) > 0;
}
