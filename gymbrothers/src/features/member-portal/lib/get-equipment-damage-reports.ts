import { desc, eq } from "drizzle-orm";

import type { ReportPriority } from "@/features/member-portal/lib/equipment-report-priority-label";
import type { EquipmentReportStatus } from "@/features/member-portal/lib/equipment-report-status";
import { db } from "@/server/db/client";
import { equipmentDamageReports, users } from "@/server/db/schema/gym-schema";

export type EquipmentDamageReportRow = {
	id: string;
	machineName: string;
	message: string;
	priority: ReportPriority;
	status: EquipmentReportStatus;
	staffNote: string | null;
	createdAt: Date;
	updatedAt: Date;
	username: string;
	userId: string;
};

export type EquipmentDamageReportsQueryResult = {
	reports: EquipmentDamageReportRow[];
	missingTable: boolean;
};

export type EquipmentDamageReportAdminRow = EquipmentDamageReportRow & {
	email: string;
};

export type EquipmentDamageReportsAdminQueryResult = {
	reports: EquipmentDamageReportAdminRow[];
	missingTable: boolean;
};

function isMissingEquipmentDamageTableError(err: unknown): boolean {
	let cur: unknown = err;
	for (let i = 0; i < 5 && cur != null; i++) {
		if (typeof cur === "object" && cur !== null && "code" in cur) {
			const code = (cur as { code?: string }).code;
			if (code === "42P01") {
				return true;
			}
		}
		cur =
			typeof cur === "object" && cur !== null && "cause" in cur
				? (cur as { cause?: unknown }).cause
				: undefined;
	}
	const msg = err instanceof Error ? err.message : String(err);
	return (
		/relation\s+"equipment_damage_reports"\s+does\s+not\s+exist/i.test(msg) ||
		(msg.includes("equipment_damage_reports") && msg.includes("does not exist"))
	);
}

export async function getEquipmentDamageReportsForCommunity(): Promise<EquipmentDamageReportsQueryResult> {
	try {
		const rows = await db
			.select({
				id: equipmentDamageReports.id,
				machineName: equipmentDamageReports.machineName,
				message: equipmentDamageReports.message,
				priority: equipmentDamageReports.priority,
				status: equipmentDamageReports.status,
				staffNote: equipmentDamageReports.staffNote,
				createdAt: equipmentDamageReports.createdAt,
				updatedAt: equipmentDamageReports.updatedAt,
				userId: equipmentDamageReports.userId,
				username: users.username,
			})
			.from(equipmentDamageReports)
			.innerJoin(users, eq(equipmentDamageReports.userId, users.id))
			.orderBy(desc(equipmentDamageReports.createdAt))
			.limit(50);
		return { reports: rows, missingTable: false };
	} catch (err) {
		if (isMissingEquipmentDamageTableError(err)) {
			if (process.env.NODE_ENV === "development") {
				console.warn(
					"[getEquipmentDamageReportsForCommunity] Tabla `equipment_damage_reports` ausente. Ejecuta: npm run db:migrate",
				);
			}
			return { reports: [], missingTable: true };
		}
		throw err;
	}
}

export async function getEquipmentDamageReportsForAdmin(): Promise<EquipmentDamageReportsAdminQueryResult> {
	try {
		const rows = await db
			.select({
				id: equipmentDamageReports.id,
				machineName: equipmentDamageReports.machineName,
				message: equipmentDamageReports.message,
				priority: equipmentDamageReports.priority,
				status: equipmentDamageReports.status,
				staffNote: equipmentDamageReports.staffNote,
				createdAt: equipmentDamageReports.createdAt,
				updatedAt: equipmentDamageReports.updatedAt,
				userId: equipmentDamageReports.userId,
				username: users.username,
				email: users.email,
			})
			.from(equipmentDamageReports)
			.innerJoin(users, eq(equipmentDamageReports.userId, users.id))
			.orderBy(desc(equipmentDamageReports.createdAt))
			.limit(200);
		return { reports: rows, missingTable: false };
	} catch (err) {
		if (isMissingEquipmentDamageTableError(err)) {
			if (process.env.NODE_ENV === "development") {
				console.warn(
					"[getEquipmentDamageReportsForAdmin] Tabla `equipment_damage_reports` ausente. Ejecuta: npm run db:migrate",
				);
			}
			return { reports: [], missingTable: true };
		}
		throw err;
	}
}
