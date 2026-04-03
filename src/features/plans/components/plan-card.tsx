"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatMxnFromCents } from "@/features/dashboard/lib/format";
import { updatePlanActiveAction } from "@/features/plans/actions/plan-actions";
import { cn } from "@/lib/utils";
import type { Plan } from "@/server/db/schema/gym-schema";

export interface PlanCardProps {
	plan: Plan;
}

export function PlanCard({ plan }: PlanCardProps): React.ReactElement {
	const router = useRouter();
	const [pending, startTransition] = useTransition();

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

	return (
		<Card
			className={cn(
				"flex flex-col border border-red-900/20 bg-slate-950/50 shadow-none backdrop-blur-sm transition-colors",
				plan.active
					? "ring-1 ring-emerald-500/25"
					: "opacity-95 ring-1 ring-slate-700/40",
			)}
		>
			<CardHeader className="space-y-1 pb-2">
				<CardTitle className="text-lg font-bold tracking-tight text-white">
					{plan.name}
				</CardTitle>
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
					<p className="text-xl font-semibold tabular-nums text-[#E11D48]">
						{plan.durationMonths} {plan.durationMonths === 1 ? "mes" : "meses"}
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
	);
}
