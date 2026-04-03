import { getMembers } from "@/features/members/lib/get-members";

import { MembersView } from "./members-view";

export async function MembersSection(): Promise<React.ReactElement> {
	const members = await getMembers();
	return <MembersView initialMembers={members} />;
}
