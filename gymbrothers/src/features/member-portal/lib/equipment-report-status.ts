import { cn } from "@/lib/utils";

export type EquipmentReportStatus = "open" | "in_progress" | "resolved";

const LABELS: Record<EquipmentReportStatus, string> = {
	open: "Recibido",
	in_progress: "En curso",
	resolved: "Resuelto",
};

const BADGE: Record<EquipmentReportStatus, string> = {
	open: "border-amber-500/40 bg-amber-500/15 text-amber-300",
	in_progress: "border-sky-500/40 bg-sky-500/15 text-sky-300",
	resolved: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
};

const ROW: Record<EquipmentReportStatus, string> = {
	open: "border-amber-500/30 bg-amber-950/20",
	in_progress: "border-sky-500/25 bg-sky-950/20",
	resolved: "border-emerald-500/25 bg-emerald-950/15",
};

export function equipmentReportStatusLabelEs(
	status: EquipmentReportStatus,
): string {
	return LABELS[status];
}

export function equipmentReportStatusBadgeClass(
	status: EquipmentReportStatus,
): string {
	return BADGE[status];
}

export function equipmentReportStatusRowClass(
	status: EquipmentReportStatus,
): string {
	return ROW[status];
}

/** Member card: borde según estado; anillo si es el reporte del usuario. */
export function equipmentDamageCardClass(
	status: EquipmentReportStatus,
	mine: boolean,
): string {
	return cn(
		"rounded-xl border px-3.5 py-3 text-sm",
		equipmentReportStatusRowClass(status),
		mine && "ring-1 ring-amber-500/25",
	);
}
