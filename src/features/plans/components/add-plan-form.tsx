import { SubscriptionPlanForm } from "@/features/plans/components/subscription-plan-form";

export interface AddPlanFormProps {
	onSuccess: () => void;
}

export function AddPlanForm({
	onSuccess,
}: AddPlanFormProps): React.ReactElement {
	return <SubscriptionPlanForm onSuccess={onSuccess} />;
}
