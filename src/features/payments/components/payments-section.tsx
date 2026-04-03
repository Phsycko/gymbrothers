import { getPaymentLedger } from "@/features/payments/lib/get-payment-ledger";
import {
	getActivePlansForPaymentPicker,
	getMembersForPaymentPicker,
} from "@/features/payments/lib/get-payment-pickers";

import { PaymentsView } from "./payments-view";

export async function PaymentsSection(): Promise<React.ReactElement> {
	const [ledger, members, plans] = await Promise.all([
		getPaymentLedger(),
		getMembersForPaymentPicker(),
		getActivePlansForPaymentPicker(),
	]);

	return <PaymentsView ledger={ledger} members={members} plans={plans} />;
}
