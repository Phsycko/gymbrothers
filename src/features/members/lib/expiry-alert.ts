import { differenceInDays, startOfDay } from "date-fns";

import type { Member } from "@/server/db/schema/gym-schema";

/**
 * True when the subscription end date falls between today and the next 3 calendar days (inclusive).
 * Not used for already-ended dates (negative day difference).
 */
export function isExpiringSoon(endDate: Date, now: Date = new Date()): boolean {
	const end = startOfDay(endDate);
	const today = startOfDay(now);
	const days = differenceInDays(end, today);
	return days >= 0 && days <= 3;
}

export type MemberExpiryFields = {
	status: Member["status"];
	subscriptionEndDate: Date | null;
};

/**
 * Pulse only for active members whose latest subscription ends within the alert window.
 * Inactive / past_due never pulse (already handled or blocked).
 */
export function shouldPulseExpiryAlert(row: MemberExpiryFields): boolean {
	if (row.status !== "active") {
		return false;
	}
	if (!row.subscriptionEndDate) {
		return false;
	}
	return isExpiringSoon(row.subscriptionEndDate);
}
