"use client";

import type { Plan } from "@/server/db/schema/gym-schema";

import { PlanCard } from "./plan-card";

export interface PlanListProps {
	plans: Plan[];
}

export function PlanList({ plans }: PlanListProps): React.ReactElement {
	if (plans.length === 0) {
		return (
			<div className="rounded-lg border border-dashed border-red-900/30 bg-slate-950/30 px-6 py-16 text-center">
				<p className="text-sm text-slate-500">
					Aún no hay planes. Crea el primero con el botón de arriba.
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
			{plans.map((plan) => (
				<PlanCard key={plan.id} plan={plan} />
			))}
		</div>
	);
}
