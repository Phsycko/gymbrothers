"use client";

import { Check, Loader2, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { formatMxnFromCents } from "@/features/dashboard/lib/format";
import { processPaymentAction } from "@/features/payments/actions/payment-actions";
import type {
	MemberPickerRow,
	PlanPickerRow,
} from "@/features/payments/lib/get-payment-pickers";
import { cn } from "@/lib/utils";

/** Select/plan dropdown is portaled — don’t let Dialog treat those clicks as “outside”. */
function isInsidePortaledOverlay(target: EventTarget | null): boolean {
	if (!(target instanceof Element)) {
		return false;
	}
	return Boolean(
		target.closest("[data-radix-popper-content-wrapper]") ||
			target.closest("[data-radix-select-content]"),
	);
}

export interface ProcessPaymentDialogProps {
	members: MemberPickerRow[];
	plans: PlanPickerRow[];
}

export function ProcessPaymentDialog({
	members,
	plans,
}: ProcessPaymentDialogProps): React.ReactElement {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [memberQuery, setMemberQuery] = useState("");
	const [memberId, setMemberId] = useState<string>("");
	const [planId, setPlanId] = useState<string>("");
	const [pending, setPending] = useState(false);

	const selectedMember = useMemo(
		() => members.find((m) => m.id === memberId),
		[members, memberId],
	);

	const selectedPlan = useMemo(
		() => plans.find((p) => p.id === planId),
		[plans, planId],
	);

	const filteredMembers = useMemo(() => {
		const q = memberQuery.trim().toLowerCase();
		if (!q) {
			return members;
		}
		return members.filter(
			(m) =>
				m.fullName.toLowerCase().includes(q) ||
				m.email.toLowerCase().includes(q),
		);
	}, [members, memberQuery]);

	function handleDialogOpen(next: boolean): void {
		setOpen(next);
		if (!next) {
			setMemberQuery("");
			setMemberId("");
			setPlanId("");
		}
	}

	async function onSubmit(e: React.FormEvent): Promise<void> {
		e.preventDefault();
		if (!memberId || !planId) {
			toast.error("Selecciona un miembro y un plan.");
			return;
		}
		setPending(true);
		try {
			const result = await processPaymentAction({ memberId, planId });
			if (result.ok) {
				void import("canvas-confetti").then(({ default: confetti }) => {
					confetti({
						particleCount: 140,
						spread: 72,
						origin: { y: 0.65 },
						colors: ["#E11D48", "#ffffff", "#0f172a", "#fca5a5"],
					});
				});
				toast.success("Pago registrado", {
					description: "Suscripción activada — el miembro quedó en activo.",
					className:
						"border-[#E11D48]/40 bg-slate-950 text-white [&>div]:text-slate-200",
					duration: 6000,
				});
				setMemberQuery("");
				setMemberId("");
				setPlanId("");
				setOpen(false);
				// Defer RSC refresh so the server-action response finishes first; avoids
				// flaky Flight decode + stuck loading when HMR/chunks are mid-update.
				queueMicrotask(() => {
					try {
						router.refresh();
					} catch {
						window.location.assign("/dashboard/payments");
					}
				});
			} else {
				toast.error("No se pudo registrar el pago", {
					description: result.error,
				});
			}
		} catch {
			toast.error("Error al procesar el pago", {
				description:
					"Revisa la consola. Si persiste, ejecuta npm run clean y reinicia el dev server.",
			});
		} finally {
			setPending(false);
		}
	}

	const canSubmit =
		!!memberId && !!planId && members.length > 0 && plans.length > 0;

	return (
		<Dialog open={open} onOpenChange={handleDialogOpen}>
			<DialogTrigger asChild>
				<Button
					type="button"
					className={cn(
						"h-11 gap-2 rounded-lg border-0 bg-[#E11D48] px-5 text-xs font-extrabold uppercase tracking-[0.18em] text-white",
						"shadow-[0_0_22px_rgba(225,29,72,0.35)] transition-all",
						"hover:bg-red-700 hover:shadow-[0_0_32px_rgba(225,29,72,0.55)]",
						"focus-visible:ring-2 focus-visible:ring-[#E11D48] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
					)}
				>
					<Plus className="h-4 w-4 text-white" aria-hidden />
					Nuevo pago
				</Button>
			</DialogTrigger>
			<DialogContent
				className="max-h-[min(90vh,720px)] overflow-y-auto border-red-600/30 bg-slate-950 sm:max-w-lg"
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
				<DialogHeader>
					<DialogTitle className="text-white">Registrar pago</DialogTitle>
					<DialogDescription className="text-slate-400">
						Efectivo o terminal: crea suscripción, pago y activa al socio en un
						solo paso.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit} className="space-y-6 pt-2">
					<div className="space-y-2">
						<Label className="text-slate-300">Socio</Label>
						<p className="text-xs text-slate-500">
							Busca y toca la fila del miembro para seleccionarlo.
						</p>
						<div className="relative">
							<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
							<Input
								type="search"
								value={memberQuery}
								onChange={(e) => setMemberQuery(e.target.value)}
								placeholder="Buscar por nombre o correo…"
								disabled={members.length === 0}
								autoComplete="off"
								className="h-11 border-slate-800 bg-black/40 pl-10 text-white placeholder:text-slate-600 focus-visible:ring-[#E11D48]"
							/>
						</div>
						<div className="max-h-[220px] overflow-y-auto rounded-md border border-slate-800 bg-black/30">
							{members.length === 0 ? (
								<p className="p-4 text-center text-sm text-slate-500">
									No hay socios en la base de datos.
								</p>
							) : filteredMembers.length === 0 ? (
								<p className="p-4 text-center text-sm text-slate-500">
									Sin coincidencias. Borra la búsqueda o prueba otro nombre.
								</p>
							) : (
								filteredMembers.map((m) => (
									<button
										key={m.id}
										type="button"
										onClick={() => setMemberId(m.id)}
										className={cn(
											"flex w-full items-start gap-3 border-b border-slate-800/90 px-3 py-3 text-left transition-colors last:border-b-0",
											"hover:bg-slate-800/90",
											memberId === m.id &&
												"bg-[#E11D48]/12 ring-1 ring-inset ring-[#E11D48]/35",
										)}
									>
										<Check
											className={cn(
												"mt-0.5 h-4 w-4 shrink-0 text-[#E11D48]",
												memberId === m.id ? "opacity-100" : "opacity-0",
											)}
											aria-hidden
										/>
										<div className="min-w-0 flex-1">
											<div className="font-medium text-white">{m.fullName}</div>
											<div className="truncate text-xs text-slate-400">
												{m.email}
											</div>
										</div>
									</button>
								))
							)}
						</div>
						{selectedMember ? (
							<p className="text-xs font-medium text-emerald-400">
								Seleccionado: {selectedMember.fullName}
							</p>
						) : (
							<p className="text-xs text-slate-600">
								Toca una fila para elegir quién paga.
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label className="text-slate-300">Plan</Label>
						<Select
							value={planId || undefined}
							onValueChange={setPlanId}
							disabled={plans.length === 0}
						>
							<SelectTrigger className="h-12 border-slate-800 bg-black/40 text-slate-100">
								<SelectValue placeholder="Elige un plan" />
							</SelectTrigger>
							<SelectContent position="popper" sideOffset={4}>
								{plans.map((p) => (
									<SelectItem key={p.id} value={p.id}>
										{p.name} · {formatMxnFromCents(p.priceCents)} ·{" "}
										{p.durationMonths}{" "}
										{p.durationMonths === 1 ? "mes" : "meses"}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="rounded-lg border border-red-600/30 bg-slate-950 px-4 py-5">
						<p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
							Total a cobrar
						</p>
						<p className="mt-1 text-4xl font-bold tabular-nums tracking-tight text-white">
							{selectedPlan ? formatMxnFromCents(selectedPlan.priceCents) : "—"}
						</p>
						{selectedPlan ? (
							<p className="mt-2 text-sm text-slate-500">
								Cubre {selectedPlan.durationMonths}{" "}
								{selectedPlan.durationMonths === 1 ? "mes" : "meses"} desde hoy.
							</p>
						) : null}
					</div>

					<Button
						type="submit"
						disabled={!canSubmit || pending}
						className="h-12 w-full bg-[#E11D48] text-sm font-bold uppercase tracking-wide text-white hover:bg-red-700 hover:shadow-[0_0_24px_rgba(225,29,72,0.45)]"
					>
						{pending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Procesando…
							</>
						) : (
							"Confirmar pago"
						)}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
