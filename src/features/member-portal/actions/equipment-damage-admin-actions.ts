"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { EquipmentReportStatus } from "@/features/member-portal/lib/equipment-report-status";
import { isAdminRole } from "@/lib/auth/roles";
import { validateRequest } from "@/lib/auth/validate-request";
import { db } from "@/server/db/client";
import { DATABASE_CONNECTION_ERROR } from "@/server/db/env";
import { equipmentDamageReports } from "@/server/db/schema/gym-schema";
import { notifyMemberEquipmentReportUpdate } from "@/server/push/notify-member-equipment-report";

export type EquipmentDamageAdminActionResult =
	| { ok: true }
	| { ok: false; error: string };

async function requireStaff(): Promise<
	{ ok: true } | { ok: false; error: string }
> {
	const { user } = await validateRequest();
	if (!user || !isAdminRole(user.role)) {
		return { ok: false, error: "No autorizado." };
	}
	return { ok: true };
}

const deleteSchema = z.object({
	reportId: z.string().uuid(),
});

const updateSchema = z.object({
	reportId: z.string().uuid(),
	status: z.enum(["open", "in_progress", "resolved"]),
	staffNote: z.string().max(500, "Máximo 500 caracteres en la nota."),
});

export async function updateEquipmentReportAdminAction(
	input: unknown,
): Promise<EquipmentDamageAdminActionResult> {
	const gate = await requireStaff();
	if (!gate.ok) {
		return { ok: false, error: gate.error };
	}
	const parsed = updateSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "Datos inválidos." };
	}
	const noteTrimmed = parsed.data.staffNote.trim();
	const nextNote = noteTrimmed.length > 0 ? noteTrimmed : null;
	const nextStatus = parsed.data.status as EquipmentReportStatus;

	try {
		const [current] = await db
			.select({
				id: equipmentDamageReports.id,
				userId: equipmentDamageReports.userId,
				machineName: equipmentDamageReports.machineName,
				status: equipmentDamageReports.status,
				staffNote: equipmentDamageReports.staffNote,
			})
			.from(equipmentDamageReports)
			.where(eq(equipmentDamageReports.id, parsed.data.reportId))
			.limit(1);

		if (!current) {
			return { ok: false, error: "Reporte no encontrado." };
		}

		const prevNote = (current.staffNote ?? "").trim();
		const changed =
			current.status !== nextStatus || prevNote !== (nextNote ?? "").trim();

		await db
			.update(equipmentDamageReports)
			.set({
				status: nextStatus,
				staffNote: nextNote,
			})
			.where(eq(equipmentDamageReports.id, parsed.data.reportId));

		revalidatePath("/dashboard/equipment-reports");
		revalidatePath("/dashboard/member/community");

		if (changed) {
			void notifyMemberEquipmentReportUpdate({
				reporterUserId: current.userId,
				machineName: current.machineName,
				status: nextStatus,
				staffNote: nextNote,
			}).catch(() => undefined);
		}

		return { ok: true };
	} catch {
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}

export async function deleteEquipmentDamageReportAdminAction(
	input: unknown,
): Promise<EquipmentDamageAdminActionResult> {
	const gate = await requireStaff();
	if (!gate.ok) {
		return { ok: false, error: gate.error };
	}
	const parsed = deleteSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "Reporte inválido." };
	}
	try {
		await db
			.delete(equipmentDamageReports)
			.where(eq(equipmentDamageReports.id, parsed.data.reportId));
		revalidatePath("/dashboard/equipment-reports");
		revalidatePath("/dashboard/member/community");
		return { ok: true };
	} catch {
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}
