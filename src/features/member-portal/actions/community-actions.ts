"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { validateRequest } from "@/lib/auth/validate-request";
import { db } from "@/server/db/client";
import { DATABASE_CONNECTION_ERROR } from "@/server/db/env";
import {
	equipmentDamageReports,
	exerciseRequests,
} from "@/server/db/schema/gym-schema";
import { notifyStaffNewEquipmentReport } from "@/server/push/notify-staff-equipment-report";

const requestSchema = z.object({
	message: z
		.string()
		.trim()
		.min(3, "Escribe al menos 3 caracteres.")
		.max(500, "Máximo 500 caracteres."),
});

const damageReportSchema = z.object({
	machineName: z
		.string()
		.trim()
		.min(2, "Indica la máquina (al menos 2 caracteres).")
		.max(120, "Máximo 120 caracteres."),
	message: z
		.string()
		.trim()
		.min(3, "Describe el problema (al menos 3 caracteres).")
		.max(1000, "Máximo 1000 caracteres."),
	priority: z.enum(["low", "medium", "high"]),
});

export type SubmitExerciseRequestResult =
	| { ok: true }
	| { ok: false; error: string };

export type SubmitEquipmentDamageReportResult =
	| { ok: true }
	| { ok: false; error: string };

export async function submitExerciseRequestAction(
	input: unknown,
): Promise<SubmitExerciseRequestResult> {
	const { user } = await validateRequest();
	if (!user || user.role !== "member") {
		return { ok: false, error: "Debes iniciar sesión como miembro." };
	}

	const parsed = requestSchema.safeParse(input);
	if (!parsed.success) {
		const msg =
			parsed.error.flatten().fieldErrors.message?.[0] ?? "Datos inválidos";
		return { ok: false, error: msg };
	}

	try {
		await db.insert(exerciseRequests).values({
			userId: user.id,
			message: parsed.data.message,
		});
		revalidatePath("/dashboard/member/community");
		return { ok: true };
	} catch {
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}

export async function submitEquipmentDamageReportAction(
	input: unknown,
): Promise<SubmitEquipmentDamageReportResult> {
	const { user } = await validateRequest();
	if (!user || user.role !== "member") {
		return { ok: false, error: "Debes iniciar sesión como miembro." };
	}

	const parsed = damageReportSchema.safeParse(input);
	if (!parsed.success) {
		const flat = parsed.error.flatten().fieldErrors;
		const msg =
			flat.machineName?.[0] ??
			flat.message?.[0] ??
			flat.priority?.[0] ??
			"Datos inválidos.";
		return { ok: false, error: msg };
	}

	try {
		await db.insert(equipmentDamageReports).values({
			userId: user.id,
			machineName: parsed.data.machineName,
			message: parsed.data.message,
			priority: parsed.data.priority,
		});
		revalidatePath("/dashboard/member/community");
		revalidatePath("/dashboard/equipment-reports");
		void notifyStaffNewEquipmentReport({
			machineName: parsed.data.machineName,
			message: parsed.data.message,
			priority: parsed.data.priority,
		}).catch(() => undefined);
		return { ok: true };
	} catch {
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}
