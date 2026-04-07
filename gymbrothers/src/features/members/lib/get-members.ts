import { desc } from "drizzle-orm";

import { db } from "@/server/db/client";
import type { Member } from "@/server/db/schema/gym-schema";
import { members, subscriptions } from "@/server/db/schema/gym-schema";

export type MemberListRow = Member & {
	/** Latest subscription end date for this member (max end_date), if any. */
	subscriptionEndDate: Date | null;
	/** Start date of that same subscription (the one with max end_date). */
	subscriptionStartDate: Date | null;
	/** Plan id of that subscription. */
	subscriptionPlanId: string | null;
};

export async function getMembers(): Promise<MemberListRow[]> {
	const memberRows = await db
		.select()
		.from(members)
		.orderBy(desc(members.createdAt));

	const subRows = await db.select().from(subscriptions);

	const bestSubByMember = new Map<
		string,
		{ endDate: Date; startDate: Date; planId: string }
	>();
	for (const s of subRows) {
		const prev = bestSubByMember.get(s.memberId);
		if (!prev || s.endDate > prev.endDate) {
			bestSubByMember.set(s.memberId, {
				endDate: s.endDate,
				startDate: s.startDate,
				planId: s.planId,
			});
		}
	}

	return memberRows.map((m) => {
		const sub = bestSubByMember.get(m.id);
		return {
			...m,
			subscriptionEndDate: sub?.endDate ?? null,
			subscriptionStartDate: sub?.startDate ?? null,
			subscriptionPlanId: sub?.planId ?? null,
		};
	});
}
