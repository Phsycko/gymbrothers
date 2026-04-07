"use client";

import {
	Loader2,
	MoreHorizontal,
	Pencil,
	RotateCcw,
	Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	deletePaymentAction,
	refundPaymentAction,
	updatePaymentAction,
} from "@/features/payments/actions/payment-actions";
import type { PaymentLedgerRow } from "@/features/payments/lib/types";

/** Select dropdown is portaled — don’t let Dialog treat those clicks as “outside”. */
function isInsidePortaledOverlay(target: EventTarget | null): boolean {
	if (!(target instanceof Element)) {
		return false;
	}
	return Boolean(
		target.closest("[data-radix-popper-content-wrapper]") ||
			target.closest("[data-radix-select-content]"),
	);
}

function parseUsdToCents(raw: string): number | null {
	const cleaned = raw.trim().replace(/[$,\s]/g, "");
	const n = Number.parseFloat(cleaned);
	if (!Number.isFinite(n) || n <= 0) {
		return null;
	}
	return Math.round(n * 100);
}

export function PaymentLedgerRowActions({
	row,
}: {
	row: PaymentLedgerRow;
}): React.ReactElement {
	const router = useRouter();
	const [editOpen, setEditOpen] = useState(false);
	const [refundOpen, setRefundOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [pending, setPending] = useState(false);

	const [amountStr, setAmountStr] = useState("");
	const [status, setStatus] = useState<PaymentLedgerRow["status"]>("completed");
	const [providerRef, setProviderRef] = useState("");

	useEffect(() => {
		if (!editOpen) {
			return;
		}
		setAmountStr((row.amountCents / 100).toFixed(2));
		setStatus(row.status);
		setProviderRef(row.providerRef);
	}, [editOpen, row]);

	async function handleEditSubmit(e: React.FormEvent): Promise<void> {
		e.preventDefault();
		const cents = parseUsdToCents(amountStr);
		if (cents === null) {
			toast.error("Importe inválido");
			return;
		}
		setPending(true);
		try {
			const result = await updatePaymentAction({
				paymentId: row.id,
				amountCents: cents !== row.amountCents ? cents : undefined,
				status: status !== row.status ? status : undefined,
				providerRef: providerRef !== row.providerRef ? providerRef : undefined,
			});
			if (result.ok) {
				toast.success("Pago actualizado");
				setEditOpen(false);
				router.refresh();
			} else {
				toast.error("No se pudo actualizar", {
					description: result.error,
				});
			}
		} finally {
			setPending(false);
		}
	}

	async function handleRefund(): Promise<void> {
		setPending(true);
		try {
			const result = await refundPaymentAction({ paymentId: row.id });
			if (result.ok) {
				toast.success("Reembolso registrado");
				setRefundOpen(false);
				router.refresh();
			} else {
				toast.error("No se pudo registrar el reembolso", {
					description: result.error,
				});
			}
		} finally {
			setPending(false);
		}
	}

	async function handleDelete(): Promise<void> {
		setPending(true);
		try {
			const result = await deletePaymentAction({ paymentId: row.id });
			if (result.ok) {
				toast.success("Pago eliminado del ledger");
				setDeleteOpen(false);
				router.refresh();
			} else {
				toast.error("No se pudo eliminar", {
					description: result.error,
				});
			}
		} finally {
			setPending(false);
		}
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 shrink-0"
						aria-label="Acciones del pago"
						type="button"
					>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-48">
					<DropdownMenuItem onClick={() => setEditOpen(true)}>
						<Pencil className="mr-2 h-4 w-4" />
						Editar
					</DropdownMenuItem>
					<DropdownMenuItem
						disabled={row.status === "refunded"}
						onClick={() => setRefundOpen(true)}
					>
						<RotateCcw className="mr-2 h-4 w-4" />
						Marcar reembolso
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="text-red-400 focus:text-red-300"
						onClick={() => setDeleteOpen(true)}
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Eliminar
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent
					onPointerDownOutside={(e) => {
						if (isInsidePortaledOverlay(e.target)) {
							e.preventDefault();
						}
					}}
					onInteractOutside={(e) => {
						if (isInsidePortaledOverlay(e.target)) {
							e.preventDefault();
						}
					}}
				>
					<form onSubmit={(e) => void handleEditSubmit(e)}>
						<DialogHeader>
							<DialogTitle>Editar pago</DialogTitle>
							<DialogDescription>
								{row.memberName} · {row.planName}
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor={`amt-${row.id}`}>Importe (MXN)</Label>
								<Input
									id={`amt-${row.id}`}
									value={amountStr}
									onChange={(e) => setAmountStr(e.target.value)}
									inputMode="decimal"
									autoComplete="off"
								/>
							</div>
							<div className="grid gap-2">
								<Label>Estado</Label>
								<Select
									value={status}
									onValueChange={(v) =>
										setStatus(v as PaymentLedgerRow["status"])
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="pending">Pendiente</SelectItem>
										<SelectItem value="completed">Completado</SelectItem>
										<SelectItem value="failed">Fallido</SelectItem>
										<SelectItem value="refunded">Reembolsado</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="grid gap-2">
								<Label htmlFor={`ref-${row.id}`}>Referencia / notas</Label>
								<Input
									id={`ref-${row.id}`}
									value={providerRef}
									onChange={(e) => setProviderRef(e.target.value)}
									placeholder="manual:cash, id PSP…"
									autoComplete="off"
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setEditOpen(false)}
							>
								Cancelar
							</Button>
							<Button type="submit" disabled={pending}>
								{pending ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									"Guardar"
								)}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog open={refundOpen} onOpenChange={setRefundOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Registrar reembolso</DialogTitle>
						<DialogDescription>
							El pago pasará a estado <strong>Refunded</strong> y se añadirá una
							marca de auditoría en la referencia. La suscripción asociada no se
							modifica automáticamente.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button
							type="button"
							variant="outline"
							onClick={() => setRefundOpen(false)}
						>
							Cancelar
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={() => void handleRefund()}
							disabled={pending}
						>
							{pending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Confirmar reembolso"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Eliminar pago del ledger</DialogTitle>
						<DialogDescription>
							Se borrará solo esta fila de pago. La suscripción del miembro no
							se elimina; revisa membresía manualmente si hace falta.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button
							type="button"
							variant="outline"
							onClick={() => setDeleteOpen(false)}
						>
							Cancelar
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={() => void handleDelete()}
							disabled={pending}
						>
							{pending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Eliminar"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
