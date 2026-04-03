import { desc } from "drizzle-orm";

import { db } from "@/server/db/client";
import type { Plan } from "@/server/db/schema/gym-schema";
import { plans } from "@/server/db/schema/gym-schema";

export async function getPlans(): Promise<Plan[]> {
	return db.select().from(plans).orderBy(desc(plans.createdAt));
}
