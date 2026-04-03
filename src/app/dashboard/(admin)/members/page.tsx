import { Suspense } from "react";

import { MembersSection } from "@/features/members/components/members-section";
import { MembersSkeleton } from "@/features/members/components/members-skeleton";

export default function MembersPage(): React.ReactElement {
	return (
		<Suspense fallback={<MembersSkeleton />}>
			<MembersSection />
		</Suspense>
	);
}
