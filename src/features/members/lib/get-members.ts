import { desc } from "drizzle-orm";

import { db } from "@/server/db/client";
import type { Member } from "@/server/db/schema/gym-schema";
import { members, subscriptions } from "@/server/db/schema/gym-schema";

export type MemberListRow = Member & {
	/** Latest subscription end date for this member (max end_date), if any. */
	subscriptionEndDate: Date | null;
};

export async function getMembers(): Promise<MemberListRow[]> {
	const memberRows = await db
		.select()
		.from(members)
		.orderBy(desc(members.createdAt));

	const subRows = await db
		.select({
			memberId: subscriptions.memberId,
			endDate: subscriptions.endDate,
		})
		.from(subscriptions);

	const bestEndByMember = new Map<string, Date>();
	for (const s of subRows) {
		const prev = bestEndByMember.get(s.memberId);
		if (!prev || s.endDate > prev) {
			bestEndByMember.set(s.memberId, s.endDate);
		}
	}

	return memberRows.map((m) => ({
		...m,
		subscriptionEndDate: bestEndByMember.get(m.id) ?? null,
	}));
}
