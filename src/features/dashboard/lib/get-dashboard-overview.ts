import {
	endOfMonth,
	format,
	startOfDay,
	startOfMonth,
	subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";

import type { DashboardOverviewData } from "@/features/dashboard/lib/types";
import { db } from "@/server/db/client";
import {
	members,
	payments,
	plans,
	subscriptions,
} from "@/server/db/schema/gym-schema";

function num(n: unknown): number {
	if (typeof n === "bigint") {
		return Number(n);
	}
	if (typeof n === "number") {
		return n;
	}
	if (typeof n === "string") {
		return Number.parseFloat(n) || 0;
	}
	return 0;
}

/**
 * KPIs, serie mensual (6 meses) y actividad reciente desde la base de datos.
 * Sin datos de demostración: si no hay registros, los totales son 0 y las listas vacías.
 */
export async function getDashboardOverview(): Promise<DashboardOverviewData> {
	const now = new Date();
	const today = startOfDay(now);
	const thisMonthStart = startOfMonth(now);
	const lastMonthStart = startOfMonth(subMonths(now, 1));
	const lastMonthEnd = endOfMonth(subMonths(now, 1));

	const [
		totalMembersRow,
		thisMonthMembersRow,
		lastMonthMembersRow,
		activeSubsRow,
		atRiskRow,
		revenueMtdRow,
		paymentRows,
		memberRows,
	] = await Promise.all([
		db.select({ c: count() }).from(members),
		db
			.select({ c: count() })
			.from(members)
			.where(gte(members.createdAt, thisMonthStart)),
		db
			.select({ c: count() })
			.from(members)
			.where(
				and(
					gte(members.createdAt, lastMonthStart),
					lte(members.createdAt, lastMonthEnd),
				),
			),
		db
			.select({ c: count() })
			.from(subscriptions)
			.where(gte(subscriptions.endDate, today)),
		db
			.select({ c: count() })
			.from(members)
			.where(eq(members.status, "past_due")),
		db
			.select({
				total: sql<string>`coalesce(sum(${payments.amountCents}), 0)`,
			})
			.from(payments)
			.where(
				and(
					eq(payments.status, "completed"),
					gte(payments.createdAt, thisMonthStart),
				),
			),
		db
			.select({
				id: payments.id,
				createdAt: payments.createdAt,
				amountCents: payments.amountCents,
				payStatus: payments.status,
				memberName: members.fullName,
				planName: plans.name,
			})
			.from(payments)
			.innerJoin(subscriptions, eq(payments.subscriptionId, subscriptions.id))
			.innerJoin(members, eq(subscriptions.memberId, members.id))
			.innerJoin(plans, eq(subscriptions.planId, plans.id))
			.orderBy(desc(payments.createdAt))
			.limit(12),
		db
			.select({
				id: members.id,
				createdAt: members.createdAt,
				fullName: members.fullName,
				email: members.email,
				memberStatus: members.status,
			})
			.from(members)
			.orderBy(desc(members.createdAt))
			.limit(12),
	]);

	const thisC = num(thisMonthMembersRow[0]?.c);
	const lastC = num(lastMonthMembersRow[0]?.c);
	let memberGrowthPercent = 0;
	if (lastC === 0) {
		memberGrowthPercent = thisC > 0 ? 100 : 0;
	} else {
		memberGrowthPercent = ((thisC - lastC) / lastC) * 100;
	}

	const chart = await Promise.all(
		[5, 4, 3, 2, 1, 0].map(async (monthsAgo) => {
			const monthDate = subMonths(startOfMonth(now), monthsAgo);
			const ms = startOfMonth(monthDate);
			const me = endOfMonth(monthDate);

			const [[revRow], [newMembersRow]] = await Promise.all([
				db
					.select({
						total: sql<string>`coalesce(sum(${payments.amountCents}), 0)`,
					})
					.from(payments)
					.where(
						and(
							eq(payments.status, "completed"),
							gte(payments.createdAt, ms),
							lte(payments.createdAt, me),
						),
					),
				db
					.select({ c: count() })
					.from(members)
					.where(and(gte(members.createdAt, ms), lte(members.createdAt, me))),
			]);

			return {
				month: format(ms, "LLL", { locale: es }),
				revenueCents: num(revRow?.total),
				members: num(newMembersRow?.c),
			};
		}),
	);

	const paymentActivities = paymentRows.map((p) => ({
		id: `pay:${p.id}`,
		kind: "payment" as const,
		title: p.memberName,
		subtitle: p.planName,
		amountCents: p.amountCents,
		status: paymentStatusToActivity(p.payStatus),
		occurredAt: p.createdAt.toISOString(),
	}));

	const memberActivities = memberRows.map((m) => ({
		id: `mem:${m.id}`,
		kind: "member" as const,
		title: m.fullName,
		subtitle: m.email,
		amountCents: undefined,
		status: memberStatusToActivity(m.memberStatus),
		occurredAt: m.createdAt.toISOString(),
	}));

	const activities = [...paymentActivities, ...memberActivities]
		.sort(
			(a, b) =>
				new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
		)
		.slice(0, 12);

	return {
		stats: {
			totalMembers: num(totalMembersRow[0]?.c),
			memberGrowthPercent,
			activeSubscriptions: num(activeSubsRow[0]?.c),
			revenueCents: num(revenueMtdRow[0]?.total),
			atRiskMembers: num(atRiskRow[0]?.c),
		},
		chart,
		activities,
	};
}

function paymentStatusToActivity(
	s: (typeof payments.$inferSelect)["status"],
): "completed" | "pending" | "failed" | "refunded" {
	if (s === "completed") {
		return "completed";
	}
	if (s === "refunded") {
		return "refunded";
	}
	if (s === "pending") {
		return "pending";
	}
	return "failed";
}

function memberStatusToActivity(
	s: (typeof members.$inferSelect)["status"],
): "active" | "inactive" | "past_due" {
	return s;
}
