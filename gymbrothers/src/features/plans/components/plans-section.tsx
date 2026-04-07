import { getPlans } from "@/features/plans/lib/get-plans";

import { PlansView } from "./plans-view";

export async function PlansSection(): Promise<React.ReactElement> {
	const plans = await getPlans();
	return <PlansView initialPlans={plans} />;
}
