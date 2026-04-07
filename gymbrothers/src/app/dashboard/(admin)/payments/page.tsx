import { Suspense } from "react";

import { PaymentsSection } from "@/features/payments/components/payments-section";
import { PaymentsSkeleton } from "@/features/payments/components/payments-skeleton";

export default function PaymentsPage(): React.ReactElement {
	return (
		<Suspense fallback={<PaymentsSkeleton />}>
			<PaymentsSection />
		</Suspense>
	);
}
