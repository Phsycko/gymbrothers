import { Suspense } from "react";

import { PlansSection } from "@/features/plans/components/plans-section";
import { PlansSkeleton } from "@/features/plans/components/plans-skeleton";

export default function SubscriptionPlansPage(): React.ReactElement {
	return (
		<Suspense fallback={<PlansSkeleton />}>
			<PlansSection />
		</Suspense>
	);
}
