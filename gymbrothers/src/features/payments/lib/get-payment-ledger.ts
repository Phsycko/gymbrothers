import { desc, eq } from "drizzle-orm";

import { db } from "@/server/db/client";
import {
	members,
	payments,
	plans,
	subscriptions,
} from "@/server/db/schema/gym-schema";

import type { PaymentLedgerRow } from "./types";

export async function getPaymentLedger(): Promise<PaymentLedgerRow[]> {
	const rows = await db
		.select({
			id: payments.id,
			amountCents: payments.amountCents,
			status: payments.status,
			createdAt: payments.createdAt,
			providerRef: payments.providerRef,
			memberName: members.fullName,
			planName: plans.name,
		})
		.from(payments)
		.innerJoin(subscriptions, eq(payments.subscriptionId, subscriptions.id))
		.innerJoin(members, eq(subscriptions.memberId, members.id))
		.innerJoin(plans, eq(subscriptions.planId, plans.id))
		.orderBy(desc(payments.createdAt));

	return rows.map((r) => ({
		id: r.id,
		memberName: r.memberName,
		planName: r.planName,
		amountCents: r.amountCents,
		createdAt: r.createdAt,
		status: r.status,
		providerRef: r.providerRef,
	}));
}
