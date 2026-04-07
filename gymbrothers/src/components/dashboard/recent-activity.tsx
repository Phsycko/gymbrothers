"use client";

import { CreditCard, UserPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatMxnFromCents } from "@/features/dashboard/lib/format";
import type { ActivityRow } from "@/features/dashboard/lib/types";

export interface RecentActivityProps {
	rows: ActivityRow[];
}

function formatRelativeEs(iso: string): string {
	const d = new Date(iso);
	const diffMs = Date.now() - d.getTime();
	const m = Math.floor(diffMs / 60_000);
	if (m < 1) {
		return "ahora";
	}
	if (m < 60) {
		return `hace ${m} min`;
	}
	const h = Math.floor(m / 60);
	if (h < 24) {
		return `hace ${h} h`;
	}
	return d.toLocaleDateString("es-MX", {
		day: "numeric",
		month: "short",
	});
}

function StatusCell({ row }: { row: ActivityRow }): React.ReactElement {
	const { status, kind } = row;
	if (kind === "payment") {
		if (status === "completed") {
			return <Badge variant="secondary">Pagado</Badge>;
		}
		if (status === "pending") {
			return <Badge variant="warning">Pendiente</Badge>;
		}
		if (status === "refunded") {
			return <Badge variant="outline">Reembolsado</Badge>;
		}
		if (status === "failed") {
			return <Badge variant="danger">Fallido</Badge>;
		}
	}
	if (status === "active") {
		return <Badge variant="success">Activo</Badge>;
	}
	if (status === "past_due") {
		return <Badge variant="danger">Vencido</Badge>;
	}
	if (status === "inactive") {
		return <Badge variant="outline">Inactivo</Badge>;
	}
	return <span className="text-xs text-slate-600">—</span>;
}

export function RecentActivity({
	rows,
}: RecentActivityProps): React.ReactElement {
	return (
		<div>
			<Card className="border-slate-800/80 bg-slate-950/50 backdrop-blur-md">
				<CardHeader>
					<CardTitle className="text-lg">Actividad reciente</CardTitle>
					<CardDescription>
						Últimos pagos y altas de socios registrados en el sistema.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{rows.length === 0 ? (
						<p className="py-10 text-center text-sm text-slate-500">
							Aún no hay actividad. Registra socios o cobros para ver el
							historial aquí.
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow className="border-slate-800 hover:bg-transparent">
									<TableHead>Tipo</TableHead>
									<TableHead>Detalle</TableHead>
									<TableHead className="text-right">Importe</TableHead>
									<TableHead>Estado</TableHead>
									<TableHead className="text-right">Cuándo</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.map((row) => (
									<TableRow key={row.id}>
										<TableCell>
											<div className="flex items-center gap-2">
												{row.kind === "member" ? (
													<UserPlus className="h-4 w-4 text-[#E11D48]" />
												) : (
													<CreditCard className="h-4 w-4 text-sky-400" />
												)}
												<span>
													{row.kind === "member" ? "Nuevo socio" : "Pago"}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<div className="font-medium text-slate-100">
												{row.title}
											</div>
											<div className="text-xs text-slate-500">
												{row.subtitle}
											</div>
										</TableCell>
										<TableCell className="text-right font-mono text-sm text-slate-300">
											{row.amountCents != null
												? formatMxnFromCents(row.amountCents)
												: "—"}
										</TableCell>
										<TableCell>
											<StatusCell row={row} />
										</TableCell>
										<TableCell className="text-right text-xs text-slate-500">
											{formatRelativeEs(row.occurredAt)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
