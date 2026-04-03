"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/server/db/client";
import { DATABASE_CONNECTION_ERROR } from "@/server/db/env";
import { plans } from "@/server/db/schema/gym-schema";

const createPlanSchema = z.object({
	name: z.string().trim().min(1, "Name is required").max(255),
	description: z.string().max(8000).optional().default(""),
	priceCents: z
		.number()
		.int("Price must be a whole number of cents")
		.positive("Price must be greater than zero")
		.max(99_999_999_99),
	durationMonths: z.union([
		z.literal(1),
		z.literal(3),
		z.literal(6),
		z.literal(12),
	]),
});

export type CreatePlanResult =
	| { ok: true }
	| { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createPlanAction(
	input: unknown,
): Promise<CreatePlanResult> {
	const parsed = createPlanSchema.safeParse(input);
	if (!parsed.success) {
		const flat = parsed.error.flatten();
		return {
			ok: false,
			error: "Validation failed",
			fieldErrors: flat.fieldErrors as Record<string, string[]>,
		};
	}

	const { name, description, priceCents, durationMonths } = parsed.data;

	try {
		await db.insert(plans).values({
			name,
			description: description ?? "",
			priceCents,
			durationMonths,
			active: true,
		});

		revalidatePath("/dashboard/subscription-plans");
		return { ok: true };
	} catch {
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}

const updateActiveSchema = z.object({
	planId: z.string().uuid(),
	active: z.boolean(),
});

export type UpdatePlanActiveResult =
	| { ok: true }
	| { ok: false; error: string };

/**
 * Soft-lifecycle: toggles catalog visibility. Plans are never hard-deleted here.
 */
export async function updatePlanActiveAction(
	input: unknown,
): Promise<UpdatePlanActiveResult> {
	const parsed = updateActiveSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "Invalid request" };
	}

	const { planId, active } = parsed.data;

	try {
		await db.update(plans).set({ active }).where(eq(plans.id, planId));

		revalidatePath("/dashboard/subscription-plans");
		return { ok: true };
	} catch {
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}
