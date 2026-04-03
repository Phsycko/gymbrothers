"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatMxnFromCents } from "@/features/dashboard/lib/format";
import {
	deletePlanAction,
	updatePlanActiveAction,
} from "@/features/plans/actions/plan-actions";
import { SubscriptionPlanForm } from "@/features/plans/components/subscription-plan-form";
import { formatPlanDurationLabel } from "@/features/plans/lib/plan-duration";
import { cn } from "@/lib/utils";
import type { Plan } from "@/server/db/schema/gym-schema";

export interface PlanCardProps {
	plan: Plan;
}

export function PlanCard({ plan }: PlanCardProps): React.ReactElement {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [deletePending, setDeletePending] = useState(false);

	function onActiveChange(checked: boolean): void {
		startTransition(() => {
			void (async () => {
				const result = await updatePlanActiveAction({
					planId: plan.id,
					active: checked,
				});
				if (result.ok) {
					toast.success(checked ? "Plan activado" : "Plan oculto", {
						description: checked
							? "Visible en el catálogo para nuevas altas."
							: "Los planes inactivos no se ofrecen como nuevos, pero siguen en el historial.",
					});
					router.refresh();
					return;
				}
				toast.error("No se pudo actualizar", { description: result.error });
			})();
		});
	}

	function onConfirmDelete(): void {
		setDeletePending(true);
		void (async () => {
			const result = await deletePlanAction({ planId: plan.id });
			setDeletePending(false);
			if (result.ok) {
				toast.success("Plan eliminado");
				setDeleteOpen(false);
				router.refresh();
				return;
			}
			toast.error("No se pudo eliminar", { description: result.error });
		})();
	}

	return (
		<>
			<Card
				className={cn(
					"flex flex-col border border-red-900/20 bg-slate-950/50 shadow-none backdrop-blur-sm transition-colors",
					plan.active
						? "ring-1 ring-emerald-500/25"
						: "opacity-95 ring-1 ring-slate-700/40",
				)}
			>
				<CardHeader className="space-y-1 pb-2">
					<div className="flex items-start justify-between gap-2">
						<CardTitle className="text-lg font-bold tracking-tight text-white">
							{plan.name}
						</CardTitle>
						<div className="flex shrink-0 gap-1">
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="h-9 w-9 text-slate-400 hover:bg-white/10 hover:text-white"
								aria-label="Editar plan"
								onClick={() => setEditOpen(true)}
							>
								<Pencil className="h-4 w-4" />
							</Button>
							<Dialog open={editOpen} onOpenChange={setEditOpen}>
								<DialogContent className="max-h-[90vh] overflow-y-auto border-slate-800 bg-slate-950 sm:max-w-lg">
									<DialogHeader>
										<DialogTitle className="text-white">
											Editar plan
										</DialogTitle>
										<DialogDescription>
											Cambia nombre, precio o duración. Los cambios aplican a
											nuevas altas; las suscripciones ya creadas conservan su
											vigencia.
										</DialogDescription>
									</DialogHeader>
									<SubscriptionPlanForm
										key={plan.id}
										plan={plan}
										onSuccess={() => setEditOpen(false)}
									/>
								</DialogContent>
							</Dialog>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="h-9 w-9 text-slate-400 hover:bg-red-950/50 hover:text-red-400"
								aria-label="Eliminar plan"
								onClick={() => setDeleteOpen(true)}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					</div>
					{plan.description ? (
						<p className="line-clamp-3 text-sm leading-relaxed text-slate-400">
							{plan.description}
						</p>
					) : (
						<p className="text-sm italic text-slate-600">Sin descripción</p>
					)}
				</CardHeader>
				<CardContent className="flex flex-1 flex-col gap-4 pt-0">
					<div className="flex flex-col gap-1">
						<span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
							Precio
						</span>
						<p className="text-3xl font-bold tabular-nums text-white">
							{formatMxnFromCents(plan.priceCents)}
						</p>
					</div>
					<div className="flex flex-col gap-1">
						<span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
							Duración
						</span>
						<p className="text-xl font-semibold text-[#E11D48]">
							{formatPlanDurationLabel(plan)}
						</p>
					</div>
				</CardContent>
				<CardFooter className="flex items-center justify-between border-t border-slate-800/80 pt-4">
					<div className="flex flex-col gap-1">
						<Label
							htmlFor={`active-${plan.id}`}
							className={cn(
								"text-xs font-semibold uppercase tracking-wider",
								plan.active ? "text-emerald-400" : "text-slate-500",
							)}
						>
							{plan.active ? "Activo" : "Inactivo"}
						</Label>
						<p className="text-[11px] text-slate-600">
							Desactiva para ocultarlo del catálogo sin borrarlo.
						</p>
					</div>
					<Switch
						id={`active-${plan.id}`}
						checked={plan.active}
						disabled={pending}
						onCheckedChange={onActiveChange}
						aria-label={plan.active ? "Desactivar plan" : "Activar plan"}
					/>
				</CardFooter>
			</Card>

			<Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<DialogContent className="border-slate-800 bg-slate-950 sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-white">
							¿Eliminar este plan?
						</DialogTitle>
						<DialogDescription className="text-slate-400">
							Se borrará definitivamente{" "}
							<span className="font-medium text-slate-200">{plan.name}</span>.
							Solo es posible si no hay suscripciones asociadas. Si hay socios
							con este plan, desactívalo en lugar de eliminarlo.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button
							type="button"
							variant="outline"
							className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800"
							disabled={deletePending}
							onClick={() => setDeleteOpen(false)}
						>
							Cancelar
						</Button>
						<Button
							type="button"
							className="bg-red-600 text-white hover:bg-red-700"
							disabled={deletePending}
							onClick={onConfirmDelete}
						>
							{deletePending ? "Eliminando…" : "Eliminar"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
