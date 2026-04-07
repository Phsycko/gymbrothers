"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateEquipmentReportAdminAction } from "@/features/member-portal/actions/equipment-damage-admin-actions";
import {
	type EquipmentReportStatus,
	equipmentReportStatusLabelEs,
} from "@/features/member-portal/lib/equipment-report-status";
import type { EquipmentDamageReportAdminRow } from "@/features/member-portal/lib/get-equipment-damage-reports";

const STATUSES: EquipmentReportStatus[] = ["open", "in_progress", "resolved"];

export function EquipmentReportStaffControls({
	report,
}: {
	report: EquipmentDamageReportAdminRow;
}): React.ReactElement {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [status, setStatus] = useState<EquipmentReportStatus>(report.status);
	const [staffNote, setStaffNote] = useState(report.staffNote ?? "");

	function onSave(): void {
		startTransition(() => {
			void (async () => {
				const r = await updateEquipmentReportAdminAction({
					reportId: report.id,
					status,
					staffNote,
				});
				if (r.ok) {
					toast.success(
						"Estado actualizado; el socio verá el cambio en Comunidad.",
					);
					router.refresh();
					return;
				}
				toast.error(r.error);
			})();
		});
	}

	const dirty =
		status !== report.status ||
		staffNote.trim() !== (report.staffNote ?? "").trim();

	return (
		<div className="mt-4 space-y-3 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
			<div className="grid gap-3 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor={`status-${report.id}`} className="text-slate-400">
						Estado (visible en Comunidad)
					</Label>
					<Select
						value={status}
						onValueChange={(v) => setStatus(v as EquipmentReportStatus)}
						disabled={pending}
					>
						<SelectTrigger id={`status-${report.id}`} className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{STATUSES.map((s) => (
								<SelectItem key={s} value={s}>
									{equipmentReportStatusLabelEs(s)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2 sm:col-span-2">
					<Label htmlFor={`note-${report.id}`} className="text-slate-400">
						Nota del staff (opcional, visible para todos los socios en este
						reporte)
					</Label>
					<Textarea
						id={`note-${report.id}`}
						value={staffNote}
						onChange={(e) => setStaffNote(e.target.value)}
						placeholder='Ej.: "Pieza pedida, llega el lunes" o "Desconectada por seguridad"'
						maxLength={500}
						rows={2}
						disabled={pending}
						className="resize-none border-slate-800 bg-slate-950 text-slate-200"
					/>
					<p className="text-[11px] text-slate-500">{staffNote.length}/500</p>
				</div>
			</div>
			<Button
				type="button"
				size="sm"
				disabled={pending || !dirty}
				onClick={onSave}
				className="bg-[#E11D48] text-white hover:bg-[#BE123C]"
			>
				{pending ? "Guardando…" : "Guardar estado y nota"}
			</Button>
		</div>
	);
}
