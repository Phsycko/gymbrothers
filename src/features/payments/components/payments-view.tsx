"use client";

import type {
	MemberPickerRow,
	PlanPickerRow,
} from "@/features/payments/lib/get-payment-pickers";
import type { PaymentLedgerRow } from "@/features/payments/lib/types";

import { PaymentHistory } from "./payment-history";
import { ProcessPaymentDialog } from "./process-payment-dialog";

export interface PaymentsViewProps {
	ledger: PaymentLedgerRow[];
	members: MemberPickerRow[];
	plans: PlanPickerRow[];
}

export function PaymentsView({
	ledger,
	members,
	plans,
}: PaymentsViewProps): React.ReactElement {
	return (
		<div className="space-y-10">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
						Pagos
					</h1>
					<p className="mt-1 max-w-2xl text-sm text-slate-500">
						Cobros manuales, activación de suscripción y libro contable en un
						solo flujo.
					</p>
				</div>
				<ProcessPaymentDialog members={members} plans={plans} />
			</div>

			<section className="space-y-3">
				<h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
					Libro de pagos
				</h2>
				<PaymentHistory rows={ledger} />
			</section>
		</div>
	);
}
