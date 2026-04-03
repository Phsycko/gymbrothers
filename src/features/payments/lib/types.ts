export type PaymentLedgerStatus =
	| "pending"
	| "completed"
	| "failed"
	| "refunded";

export type PaymentLedgerRow = {
	id: string;
	memberName: string;
	planName: string;
	amountCents: number;
	createdAt: Date;
	status: PaymentLedgerStatus;
	providerRef: string;
};
