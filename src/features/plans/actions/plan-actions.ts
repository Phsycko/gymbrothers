"use server";

import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { isAdminRole } from "@/lib/auth/roles";
import { validateRequest } from "@/lib/auth/validate-request";
import { db } from "@/server/db/client";
import { DATABASE_CONNECTION_ERROR } from "@/server/db/env";
import { plans, subscriptions } from "@/server/db/schema/gym-schema";

const durationPresetSchema = z.enum(["1w", "1m", "3m", "6m", "12m"]);

function durationPresetToColumns(
	preset: z.infer<typeof durationPresetSchema>,
): { durationMonths: number; durationWeeks: number | null } {
	switch (preset) {
		case "1w":
			return { durationMonths: 0, durationWeeks: 1 };
		case "1m":
			return { durationMonths: 1, durationWeeks: null };
		case "3m":
			return { durationMonths: 3, durationWeeks: null };
		case "6m":
			return { durationMonths: 6, durationWeeks: null };
		case "12m":
			return { durationMonths: 12, durationWeeks: null };
	}
}

async function requireStaff(): Promise<
	{ ok: true } | { ok: false; error: string }
> {
	const { user } = await validateRequest();
	if (!user || !isAdminRole(user.role)) {
		return { ok: false, error: "No autorizado." };
	}
	return { ok: true };
}

const createPlanSchema = z.object({
	name: z.string().trim().min(1, "Name is required").max(255),
	description: z.string().max(8000).optional().default(""),
	priceCents: z
		.number()
		.int("Price must be a whole number of cents")
		.positive("Price must be greater than zero")
		.max(99_999_999_99),
	durationPreset: durationPresetSchema,
});

export type CreatePlanResult =
	| { ok: true }
	| { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createPlanAction(
	input: unknown,
): Promise<CreatePlanResult> {
	const gate = await requireStaff();
	if (!gate.ok) {
		return { ok: false, error: gate.error };
	}

	const parsed = createPlanSchema.safeParse(input);
	if (!parsed.success) {
		const flat = parsed.error.flatten();
		return {
			ok: false,
			error: "Validation failed",
			fieldErrors: flat.fieldErrors as Record<string, string[]>,
		};
	}

	const { name, description, priceCents, durationPreset } = parsed.data;
	const { durationMonths, durationWeeks } =
		durationPresetToColumns(durationPreset);

	try {
		await db.insert(plans).values({
			name,
			description: description ?? "",
			priceCents,
			durationMonths,
			durationWeeks,
			active: true,
		});

		revalidatePath("/dashboard/subscription-plans");
		return { ok: true };
	} catch {
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}

const updatePlanSchema = createPlanSchema.extend({
	planId: z.string().uuid(),
});

export type UpdatePlanResult =
	| { ok: true }
	| { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updatePlanAction(
	input: unknown,
): Promise<UpdatePlanResult> {
	const gate = await requireStaff();
	if (!gate.ok) {
		return { ok: false, error: gate.error };
	}

	const parsed = updatePlanSchema.safeParse(input);
	if (!parsed.success) {
		const flat = parsed.error.flatten();
		return {
			ok: false,
			error: "Validation failed",
			fieldErrors: flat.fieldErrors as Record<string, string[]>,
		};
	}

	const { planId, name, description, priceCents, durationPreset } = parsed.data;
	const { durationMonths, durationWeeks } =
		durationPresetToColumns(durationPreset);

	try {
		await db
			.update(plans)
			.set({
				name,
				description: description ?? "",
				priceCents,
				durationMonths,
				durationWeeks,
			})
			.where(eq(plans.id, planId));

		revalidatePath("/dashboard/subscription-plans");
		revalidatePath("/dashboard/payments");
		return { ok: true };
	} catch {
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}

const deletePlanSchema = z.object({
	planId: z.string().uuid(),
});

export type DeletePlanResult = { ok: true } | { ok: false; error: string };

function isForeignKeyViolation(err: unknown): boolean {
	if (typeof err !== "object" || err === null || !("code" in err)) {
		return false;
	}
	return (err as { code?: string }).code === "23503";
}

export async function deletePlanAction(
	input: unknown,
): Promise<DeletePlanResult> {
	const gate = await requireStaff();
	if (!gate.ok) {
		return { ok: false, error: gate.error };
	}

	const parsed = deletePlanSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "Solicitud inválida." };
	}

	const { planId } = parsed.data;

	try {
		const [row] = await db
			.select({ n: count() })
			.from(subscriptions)
			.where(eq(subscriptions.planId, planId));

		const n = Number(row?.n ?? 0);
		if (n > 0) {
			return {
				ok: false,
				error:
					"No se puede eliminar: hay suscripciones (histórico de pagos) vinculadas a este plan. Desactívalo en su lugar.",
			};
		}

		await db.delete(plans).where(eq(plans.id, planId));

		revalidatePath("/dashboard/subscription-plans");
		revalidatePath("/dashboard/payments");
		return { ok: true };
	} catch (err) {
		if (isForeignKeyViolation(err)) {
			return {
				ok: false,
				error:
					"No se puede eliminar: el plan está en uso. Desactívalo en el catálogo en su lugar.",
			};
		}
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

export async function updatePlanActiveAction(
	input: unknown,
): Promise<UpdatePlanActiveResult> {
	const gate = await requireStaff();
	if (!gate.ok) {
		return { ok: false, error: gate.error };
	}

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
