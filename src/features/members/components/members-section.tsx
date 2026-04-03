import { getMembers } from "@/features/members/lib/get-members";
import { selectActivePlansForPaymentPicker } from "@/features/plans/lib/plan-db-compat";

import { MembersView } from "./members-view";

export async function MembersSection(): Promise<React.ReactElement> {
	const [members, plans] = await Promise.all([
		getMembers(),
		selectActivePlansForPaymentPicker(),
	]);
	return <MembersView initialMembers={members} plans={plans} />;
}
