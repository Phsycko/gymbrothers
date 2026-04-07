import { asc } from "drizzle-orm";

import { selectActivePlansForPaymentPicker } from "@/features/plans/lib/plan-db-compat";
import { db } from "@/server/db/client";
import { members } from "@/server/db/schema/gym-schema";

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
	durationWeeks: number | null;
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
	return selectActivePlansForPaymentPicker();
}
