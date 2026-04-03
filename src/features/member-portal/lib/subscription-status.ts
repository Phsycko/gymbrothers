import { differenceInCalendarDays, startOfDay } from "date-fns";

import type { Subscription } from "@/server/db/schema/gym-schema";

export type SubscriptionUiStatus = {
	/** True when the latest subscription end date is today or later. */
	isActive: boolean;
	/** Whole calendar days until end date (0 = last day). Negative when expired. */
	daysRemaining: number;
};

export function getSubscriptionUiStatus(
	subscription: Subscription | null,
	now: Date = new Date(),
): SubscriptionUiStatus {
	if (!subscription) {
		return { isActive: false, daysRemaining: 0 };
	}
	const today = startOfDay(now);
	const end = startOfDay(subscription.endDate);
	const daysRemaining = differenceInCalendarDays(end, today);
	return {
		isActive: daysRemaining >= 0,
		daysRemaining,
	};
}

/**
 * Same calendar rule as {@link getSubscriptionUiStatus}: vigente cuando la fecha de fin
 * (p. ej. la última suscripción del socio) es hoy o posterior.
 */
export function isMembershipActiveFromEndDate(
	endDate: Date | null,
	now: Date = new Date(),
): boolean {
	if (!endDate) {
		return false;
	}
	const today = startOfDay(now);
	const end = startOfDay(endDate);
	return differenceInCalendarDays(end, today) >= 0;
}
