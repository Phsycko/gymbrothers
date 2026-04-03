export interface VitalStats {
	totalMembers: number;
	memberGrowthPercent: number;
	activeSubscriptions: number;
	revenueCents: number;
	atRiskMembers: number;
}

export interface ChartDatum {
	month: string;
	revenueCents: number;
	members: number;
}

/** Pagos y altas de socios recientes (datos reales de la BD). */
export type ActivityKind = "payment" | "member";

export type ActivityDisplayStatus =
	| "active"
	| "inactive"
	| "past_due"
	| "completed"
	| "pending"
	| "failed"
	| "refunded";

export interface ActivityRow {
	id: string;
	kind: ActivityKind;
	title: string;
	subtitle: string;
	amountCents?: number;
	status: ActivityDisplayStatus;
	occurredAt: string;
}

export interface DashboardOverviewData {
	stats: VitalStats;
	chart: ChartDatum[];
	activities: ActivityRow[];
}
