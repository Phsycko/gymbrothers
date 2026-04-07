import { selectAllPlansOrdered } from "@/features/plans/lib/plan-db-compat";
import type { Plan } from "@/server/db/schema/gym-schema";

export async function getPlans(): Promise<Plan[]> {
	return selectAllPlansOrdered();
}
