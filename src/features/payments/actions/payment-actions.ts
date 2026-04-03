"use server";

import { addMonths, startOfDay } from "date-fns";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/server/db/client";
import { DATABASE_CONNECTION_ERROR } from "@/server/db/env";
import {
	members,
	payments,
	plans,
	subscriptions,
} from "@/server/db/schema/gym-schema";

const processPaymentSchema = z.object({
	memberId: z.string().uuid(),
	planId: z.string().uuid(),
});

export type ProcessPaymentResult = { ok: true } | { ok: false; error: string };

const paymentIdSchema = z.object({
	paymentId: z.string().uuid(),
});

const updatePaymentSchema = z.object({
	paymentId: z.string().uuid(),
	amountCents: z.number().int().positive().optional(),
	status: z.enum(["pending", "completed", "failed", "refunded"]).optional(),
	providerRef: z.string().max(512).optional(),
});

/**
 * Atomically creates subscription + completed payment and activates the member.
 * Manual admin registration (cash/terminal) — no external PSP.
 */
export async function processPaymentAction(
	input: unknown,
): Promise<ProcessPaymentResult> {
	const parsed = processPaymentSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "Invalid member or plan selection." };
	}

	const { memberId, planId } = parsed.data;

	try {
		await db.transaction(async (tx) => {
			const [plan] = await tx
				.select({
					id: plans.id,
					priceCents: plans.priceCents,
					durationMonths: plans.durationMonths,
					active: plans.active,
				})
				.from(plans)
				.where(eq(plans.id, planId))
				.limit(1);

			if (!plan?.active) {
				throw new Error("PLAN_UNAVAILABLE");
			}

			const [member] = await tx
				.select({ id: members.id })
				.from(members)
				.where(eq(members.id, memberId))
				.limit(1);

			if (!member) {
				throw new Error("MEMBER_NOT_FOUND");
			}

			const startDate = startOfDay(new Date());
			const endDate = addMonths(startDate, plan.durationMonths);

			const [sub] = await tx
				.insert(subscriptions)
				.values({
					memberId,
					planId,
					startDate,
					endDate,
					autoRenew: false,
				})
				.returning({ id: subscriptions.id });

			if (!sub) {
				throw new Error("SUBSCRIPTION_INSERT_FAILED");
			}

			await tx.insert(payments).values({
				subscriptionId: sub.id,
				amountCents: plan.priceCents,
				status: "completed",
				providerRef: "manual:cash",
			});

			await tx
				.update(members)
				.set({ status: "active" })
				.where(eq(members.id, memberId));
		});

		revalidatePath("/dashboard/payments");
		revalidatePath("/dashboard/members");
		return { ok: true };
	} catch (err) {
		const msg = err instanceof Error ? err.message : "";
		if (msg === "PLAN_UNAVAILABLE") {
			return { ok: false, error: "That plan is not available." };
		}
		if (msg === "MEMBER_NOT_FOUND") {
			return { ok: false, error: "Member not found." };
		}
		if (msg === "SUBSCRIPTION_INSERT_FAILED") {
			return { ok: false, error: "Could not create subscription." };
		}
		if (msg.includes("No transactions support in neon-http driver")) {
			return {
				ok: false,
				error:
					"Database driver cannot run transactions. Use neon-serverless (Pool), not neon-http.",
			};
		}
		if (process.env.NODE_ENV === "development") {
			console.error("[processPaymentAction]", err);
		}
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}

/**
 * Admin correction: amount, status, and/or provider reference (e.g. notes, PSP id).
 */
export async function updatePaymentAction(
	input: unknown,
): Promise<ProcessPaymentResult> {
	const parsed = updatePaymentSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "Invalid payment update." };
	}

	const { paymentId, amountCents, status, providerRef } = parsed.data;
	if (
		amountCents === undefined &&
		status === undefined &&
		providerRef === undefined
	) {
		return { ok: false, error: "No changes to apply." };
	}

	try {
		const [existing] = await db
			.select({ id: payments.id })
			.from(payments)
			.where(eq(payments.id, paymentId))
			.limit(1);

		if (!existing) {
			return { ok: false, error: "Payment not found." };
		}

		await db
			.update(payments)
			.set({
				...(amountCents !== undefined ? { amountCents } : {}),
				...(status !== undefined ? { status } : {}),
				...(providerRef !== undefined ? { providerRef } : {}),
				updatedAt: new Date(),
			})
			.where(eq(payments.id, paymentId));

		revalidatePath("/dashboard/payments");
		return { ok: true };
	} catch (err) {
		if (process.env.NODE_ENV === "development") {
			console.error("[updatePaymentAction]", err);
		}
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}

/**
 * Marks payment as refunded and appends a timestamp tag to `provider_ref` (audit).
 */
export async function refundPaymentAction(
	input: unknown,
): Promise<ProcessPaymentResult> {
	const parsed = paymentIdSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "Invalid payment." };
	}

	const { paymentId } = parsed.data;

	try {
		const [row] = await db
			.select({
				status: payments.status,
				providerRef: payments.providerRef,
			})
			.from(payments)
			.where(eq(payments.id, paymentId))
			.limit(1);

		if (!row) {
			return { ok: false, error: "Payment not found." };
		}
		if (row.status === "refunded") {
			return { ok: false, error: "This payment is already refunded." };
		}

		const tag = `refunded:${new Date().toISOString().slice(0, 19)}Z`;
		const merged = row.providerRef
			? `${row.providerRef} | ${tag}`
			: `manual | ${tag}`;

		await db
			.update(payments)
			.set({
				status: "refunded",
				providerRef: merged.slice(0, 512),
				updatedAt: new Date(),
			})
			.where(eq(payments.id, paymentId));

		revalidatePath("/dashboard/payments");
		return { ok: true };
	} catch (err) {
		if (process.env.NODE_ENV === "development") {
			console.error("[refundPaymentAction]", err);
		}
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}

/** Removes the ledger row only; linked subscription is unchanged. */
export async function deletePaymentAction(
	input: unknown,
): Promise<ProcessPaymentResult> {
	const parsed = paymentIdSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "Invalid payment." };
	}

	const { paymentId } = parsed.data;

	try {
		const deleted = await db
			.delete(payments)
			.where(eq(payments.id, paymentId))
			.returning({ id: payments.id });

		if (deleted.length === 0) {
			return { ok: false, error: "Payment not found." };
		}

		revalidatePath("/dashboard/payments");
		return { ok: true };
	} catch (err) {
		if (process.env.NODE_ENV === "development") {
			console.error("[deletePaymentAction]", err);
		}
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}
