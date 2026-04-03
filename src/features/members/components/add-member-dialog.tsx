"use client";

import { UserPlus } from "lucide-react";
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

import { AddMemberForm, type PlanPickerPlan } from "./add-member-form";

export interface AddMemberDialogProps {
	plans: PlanPickerPlan[];
}

export function AddMemberDialog({
	plans,
}: AddMemberDialogProps): React.ReactElement {
	const [open, setOpen] = useState(false);

	return (
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
					<UserPlus className="h-4 w-4 stroke-[2.5] text-white" aria-hidden />
					Añadir socio
				</Button>
			</DialogTrigger>
			<DialogContent
				className="max-h-[90vh] overflow-y-auto border-slate-800 bg-slate-950 sm:max-w-lg"
				onPointerDownOutside={(e) => {
					const t = e.target as HTMLElement;
					if (
						t.closest("[data-radix-popper-content-wrapper]") ||
						t.closest("[data-radix-select-content]")
					) {
						e.preventDefault();
					}
				}}
			>
				<DialogHeader>
					<DialogTitle className="text-slate-50">Nuevo socio</DialogTitle>
					<DialogDescription className="text-slate-400">
						Datos de acceso, plan y fecha de inicio. Se genera un QR único y la
						vigencia se calcula según el plan (semanal o mensual).
					</DialogDescription>
				</DialogHeader>
				<AddMemberForm plans={plans} onSuccess={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
}
