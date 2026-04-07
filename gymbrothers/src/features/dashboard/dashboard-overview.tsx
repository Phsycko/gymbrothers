"use client";

import { Activity, AlertTriangle, DollarSign, Users } from "lucide-react";
import dynamic from "next/dynamic";

import { StatCard } from "@/components/dashboard/stat-card";
import { formatMxnFromCents } from "@/features/dashboard/lib/format";
import type { DashboardOverviewData } from "@/features/dashboard/lib/types";

const RevenueMembersChart = dynamic(
	() =>
		import("@/components/dashboard/revenue-members-chart").then(
			(m) => m.RevenueMembersChart,
		),
	{
		loading: () => (
			<div
				className="h-[380px] animate-pulse rounded-xl border border-slate-800/60 bg-slate-900/20"
				aria-hidden
			/>
		),
	},
);

const RecentActivity = dynamic(
	() =>
		import("@/components/dashboard/recent-activity").then(
			(m) => m.RecentActivity,
		),
	{
		loading: () => (
			<div
				className="h-72 animate-pulse rounded-xl border border-slate-800/60 bg-slate-900/20"
				aria-hidden
			/>
		),
	},
);

export interface DashboardOverviewProps {
	data: DashboardOverviewData;
}

export function DashboardOverview({
	data,
}: DashboardOverviewProps): React.ReactElement {
	const { stats, chart, activities } = data;
	const growth = `${stats.memberGrowthPercent >= 0 ? "+" : ""}${stats.memberGrowthPercent.toFixed(1)}% vs mes anterior`;

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-slate-50 md:text-3xl">
					Resumen
				</h1>
				<p className="mt-1 text-sm text-slate-500">
					Estado del gimnasio: ingresos, socios y alertas.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<StatCard
					title="Socios totales"
					value={stats.totalMembers.toLocaleString("es-MX")}
					subtitle="Histórico en el roster"
					icon={Users}
					trend={{ value: growth, positive: stats.memberGrowthPercent >= 0 }}
				/>
				<StatCard
					title="Suscripciones activas"
					value={stats.activeSubscriptions.toLocaleString("es-MX")}
					subtitle="Planes con vigencia"
					icon={Activity}
				/>
				<StatCard
					title="Ingresos (mes)"
					value={formatMxnFromCents(stats.revenueCents)}
					subtitle="Bruto, antes de comisiones"
					icon={DollarSign}
				/>
				<StatCard
					title="En riesgo"
					value={stats.atRiskMembers.toLocaleString("es-MX")}
					subtitle="Vencido o pago fallido"
					icon={AlertTriangle}
					iconClassName="text-rose-500/90"
				/>
			</div>

			<RevenueMembersChart data={chart} />
			<RecentActivity rows={activities} />
		</div>
	);
}
