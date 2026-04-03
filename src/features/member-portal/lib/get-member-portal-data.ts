import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/server/db/client";
import {
	members,
	plans,
	subscriptions,
} from "@/server/db/schema/gym-schema";
import type {
	Member,
	Plan,
	Subscription,
} from "@/server/db/schema/gym-schema";

export type MemberPortalData = {
	member: Member | null;
	subscription: Subscription | null;
	plan: Plan | null;
};

/**
 * Resolves the gym member by linked `userId` (preferred) or legacy email match.
 */
export async function getMemberPortalData(
	userId: string,
	userEmail: string,
): Promise<MemberPortalData> {
	const [byUser] = await db
		.select()
		.from(members)
		.where(eq(members.userId, userId))
		.limit(1);

	let memberRow: Member | undefined = byUser;
	if (!memberRow) {
		const normalized = userEmail.trim().toLowerCase();
		const [byEmail] = await db
			.select()
			.from(members)
			.where(sql`lower(${members.email}) = ${normalized}`)
			.limit(1);
		memberRow = byEmail;
	}

	if (!memberRow) {
		return { member: null, subscription: null, plan: null };
	}

	const [row] = await db
		.select({
			subscription: subscriptions,
			plan: plans,
		})
		.from(subscriptions)
		.innerJoin(plans, eq(subscriptions.planId, plans.id))
		.where(eq(subscriptions.memberId, memberRow.id))
		.orderBy(desc(subscriptions.endDate))
		.limit(1);

	return {
		member: memberRow,
		subscription: row?.subscription ?? null,
		plan: row?.plan ?? null,
	};
}
