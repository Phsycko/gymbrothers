import { asc, eq } from "drizzle-orm";

import { db } from "@/server/db/client";
import { members, plans } from "@/server/db/schema/gym-schema";

export type MemberPickerRow = {
	id: string;
	fullName: string;
	email: string;
};

export type PlanPickerRow = {
	id: string;
	name: string;
	priceCents: number;
	durationMonths: number;
};

export async function getMembersForPaymentPicker(): Promise<MemberPickerRow[]> {
	return db
		.select({
			id: members.id,
			fullName: members.fullName,
			email: members.email,
		})
		.from(members)
		.orderBy(asc(members.fullName));
}

export async function getActivePlansForPaymentPicker(): Promise<
	PlanPickerRow[]
> {
	return db
		.select({
			id: plans.id,
			name: plans.name,
			priceCents: plans.priceCents,
			durationMonths: plans.durationMonths,
		})
		.from(plans)
		.where(eq(plans.active, true))
		.orderBy(asc(plans.name));
}
