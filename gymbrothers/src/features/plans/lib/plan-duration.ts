import { addMonths, addWeeks } from "date-fns";

import type { Plan } from "@/server/db/schema/gym-schema";

export type PlanDurationPreset = "1w" | "1m" | "3m" | "6m" | "12m";

/** Alinea un plan guardado con las opciones del formulario admin. */
export function planToDurationPreset(
	plan: Pick<Plan, "durationMonths" | "durationWeeks">,
): PlanDurationPreset {
	if (plan.durationWeeks != null && plan.durationWeeks > 0) {
		return "1w";
	}
	const m = plan.durationMonths;
	if (m === 1) {
		return "1m";
	}
	if (m === 3) {
		return "3m";
	}
	if (m === 6) {
		return "6m";
	}
	if (m === 12) {
		return "12m";
	}
	return "1m";
}

export function computeSubscriptionEndDate(
	startDate: Date,
	plan: Pick<Plan, "durationMonths" | "durationWeeks">,
): Date {
	const w = plan.durationWeeks;
	if (w != null && w > 0) {
		return addWeeks(startDate, w);
	}
	return addMonths(startDate, plan.durationMonths);
}

export function formatPlanDurationLabel(
	plan: Pick<Plan, "durationMonths" | "durationWeeks">,
): string {
	const w = plan.durationWeeks;
	if (w != null && w > 0) {
		return w === 1 ? "1 semana" : `${w} semanas`;
	}
	const m = plan.durationMonths;
	return `${m} ${m === 1 ? "mes" : "meses"}`;
}
