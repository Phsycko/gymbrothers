"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatMxnFromCents } from "@/features/dashboard/lib/format";
import type { PaymentLedgerRow } from "@/features/payments/lib/types";
import { cn } from "@/lib/utils";

import { PaymentLedgerRowActions } from "./payment-ledger-row-actions";

function StatusBadge({
	status,
}: {
	status: PaymentLedgerRow["status"];
}): React.ReactElement {
	if (status === "completed") {
		return (
			<Badge
				variant="outline"
				className="border-emerald-500/40 bg-emerald-950/40 font-medium text-emerald-400"
			>
				Completado
			</Badge>
		);
	}
	if (status === "pending") {
		return (
			<Badge
				variant="outline"
				className="border-amber-500/35 bg-amber-950/30 font-medium text-amber-400"
			>
				Pendiente
			</Badge>
		);
	}
	if (status === "refunded") {
		return (
			<Badge
				variant="outline"
				className="border-violet-500/40 bg-violet-950/35 font-medium text-violet-300"
			>
				Reembolsado
			</Badge>
		);
	}
	return (
		<Badge
			variant="outline"
			className="border-red-500/40 bg-red-950/40 font-medium text-red-400"
		>
			Fallido
		</Badge>
	);
}

export interface PaymentHistoryProps {
	rows: PaymentLedgerRow[];
}

export function PaymentHistory({
	rows,
}: PaymentHistoryProps): React.ReactElement {
	if (rows.length === 0) {
		return (
			<div className="rounded-lg border border-dashed border-red-600/25 bg-slate-950 px-6 py-14 text-center">
				<p className="text-sm text-slate-500">
					Aún no hay movimientos. Registra un pago manual para ver el libro
					contable.
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-lg border border-red-600/30 bg-slate-950">
			<Table>
				<TableHeader>
					<TableRow className="border-b border-slate-800/90 hover:bg-transparent">
						<TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500">
							Socio
						</TableHead>
						<TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500">
							Plan
						</TableHead>
						<TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500">
							Importe
						</TableHead>
						<TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500">
							Fecha
						</TableHead>
						<TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500">
							Estado
						</TableHead>
						<TableHead className="w-12 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
							<span className="sr-only">Acciones</span>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{rows.map((row) => (
						<TableRow
							key={row.id}
							className={cn(
								"border-b border-slate-800/60 transition-colors",
								"hover:bg-red-950/10",
							)}
						>
							<TableCell className="font-medium text-slate-100">
								{row.memberName}
							</TableCell>
							<TableCell className="text-slate-400">{row.planName}</TableCell>
							<TableCell className="font-mono text-sm tabular-nums text-white">
								{formatMxnFromCents(row.amountCents)}
							</TableCell>
							<TableCell className="text-sm text-slate-500">
								{format(row.createdAt, "d MMM yyyy · HH:mm", { locale: es })}
							</TableCell>
							<TableCell>
								<StatusBadge status={row.status} />
							</TableCell>
							<TableCell className="text-right">
								<PaymentLedgerRowActions row={row} />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
