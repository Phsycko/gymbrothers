import { asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/server/db/client";
import type { Plan, Subscription } from "@/server/db/schema/gym-schema";
import { plans, subscriptions } from "@/server/db/schema/gym-schema";

/**
 * Neon/Postgres cuando el esquema local añade `duration_weeks` pero la migración
 * no se ha aplicado (p. ej. journal desincronizado).
 */
export function isMissingDurationWeeksColumnError(err: unknown): boolean {
	const msg = err instanceof Error ? err.message : String(err);
	if (/duration_weeks/i.test(msg) && /does not exist/i.test(msg)) {
		return true;
	}
	if (typeof err === "object" && err !== null && "code" in err) {
		const code = (err as { code?: string }).code;
		if (code === "42703" && /duration_weeks/i.test(msg)) {
			return true;
		}
	}
	let cur: unknown = err;
	for (let i = 0; i < 4 && cur != null; i++) {
		if (typeof cur === "object" && cur !== null && "cause" in cur) {
			cur = (cur as { cause?: unknown }).cause;
			if (isMissingDurationWeeksColumnError(cur)) {
				return true;
			}
		} else {
			break;
		}
	}
	return false;
}

/** Misma forma que `plans.$inferSelect` sin leer la columna física `duration_weeks`. */
const planRowSansWeeksColumn = {
	id: plans.id,
	name: plans.name,
	description: plans.description,
	priceCents: plans.priceCents,
	durationMonths: plans.durationMonths,
	durationWeeks: sql<number | null>`NULL::integer`,
	active: plans.active,
	createdAt: plans.createdAt,
	updatedAt: plans.updatedAt,
};

export async function selectAllPlansOrdered(): Promise<Plan[]> {
	try {
		return await db.select().from(plans).orderBy(desc(plans.createdAt));
	} catch (e) {
		if (!isMissingDurationWeeksColumnError(e)) {
			throw e;
		}
		return db
			.select(planRowSansWeeksColumn)
			.from(plans)
			.orderBy(desc(plans.createdAt));
	}
}

export async function selectActivePlansForPaymentPicker(): Promise<
	Array<{
		id: string;
		name: string;
		priceCents: number;
		durationMonths: number;
		durationWeeks: number | null;
	}>
> {
	try {
		return await db
			.select({
				id: plans.id,
				name: plans.name,
				priceCents: plans.priceCents,
				durationMonths: plans.durationMonths,
				durationWeeks: plans.durationWeeks,
			})
			.from(plans)
			.where(eq(plans.active, true))
			.orderBy(asc(plans.name));
	} catch (e) {
		if (!isMissingDurationWeeksColumnError(e)) {
			throw e;
		}
		return db
			.select({
				id: plans.id,
				name: plans.name,
				priceCents: plans.priceCents,
				durationMonths: plans.durationMonths,
				durationWeeks: sql<number | null>`NULL::integer`,
			})
			.from(plans)
			.where(eq(plans.active, true))
			.orderBy(asc(plans.name));
	}
}

export async function selectLatestSubscriptionWithPlanForMember(
	memberId: string,
): Promise<{ subscription: Subscription; plan: Plan } | undefined> {
	try {
		const [row] = await db
			.select({
				subscription: subscriptions,
				plan: plans,
			})
			.from(subscriptions)
			.innerJoin(plans, eq(subscriptions.planId, plans.id))
			.where(eq(subscriptions.memberId, memberId))
			.orderBy(desc(subscriptions.endDate))
			.limit(1);
		return row;
	} catch (e) {
		if (!isMissingDurationWeeksColumnError(e)) {
			throw e;
		}
		const [row] = await db
			.select({
				subscription: subscriptions,
				plan: {
					id: plans.id,
					name: plans.name,
					description: plans.description,
					priceCents: plans.priceCents,
					durationMonths: plans.durationMonths,
					durationWeeks: sql<number | null>`NULL::integer`,
					active: plans.active,
					createdAt: plans.createdAt,
					updatedAt: plans.updatedAt,
				},
			})
			.from(subscriptions)
			.innerJoin(plans, eq(subscriptions.planId, plans.id))
			.where(eq(subscriptions.memberId, memberId))
			.orderBy(desc(subscriptions.endDate))
			.limit(1);
		return row as { subscription: Subscription; plan: Plan };
	}
}
