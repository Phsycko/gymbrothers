"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Plan } from "@/server/db/schema/gym-schema";

import { AddPlanForm } from "./add-plan-form";
import { PlanList } from "./plan-list";

export interface PlansViewProps {
	initialPlans: Plan[];
}

export function PlansView({
	initialPlans,
}: PlansViewProps): React.ReactElement {
	const [open, setOpen] = useState(false);

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
						Planes de suscripción
					</h1>
					<p className="mt-1 max-w-2xl text-sm text-slate-500">
						Define precios en centavos de peso y controla la visibilidad con
						Activo / Inactivo (sin borrados duros).
					</p>
				</div>
				<Dialog open={open} onOpenChange={setOpen}>
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
							Crear plan
						</Button>
					</DialogTrigger>
					<DialogContent className="max-h-[90vh] overflow-y-auto border-slate-800 bg-slate-950 sm:max-w-lg">
						<DialogHeader>
							<DialogTitle className="text-white">
								Nuevo plan de suscripción
							</DialogTitle>
							<DialogDescription>
								Los precios se guardan en centavos de peso. La duración define
								el ciclo de cobro.
							</DialogDescription>
						</DialogHeader>
						<AddPlanForm onSuccess={() => setOpen(false)} />
					</DialogContent>
				</Dialog>
			</div>

			<PlanList plans={initialPlans} />
		</div>
	);
}
