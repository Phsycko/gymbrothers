"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { deleteEquipmentDamageReportAdminAction } from "@/features/member-portal/actions/equipment-damage-admin-actions";
import { EquipmentReportStaffControls } from "@/features/member-portal/components/equipment-report-staff-controls";
import {
	reportPriorityBadgeClass,
	reportPriorityLabelEs,
} from "@/features/member-portal/lib/equipment-report-priority-label";
import {
	equipmentReportStatusBadgeClass,
	equipmentReportStatusLabelEs,
} from "@/features/member-portal/lib/equipment-report-status";
import type { EquipmentDamageReportAdminRow } from "@/features/member-portal/lib/get-equipment-damage-reports";
import { cn } from "@/lib/utils";

function formatDateTime(d: Date): string {
	return d.toLocaleString("es", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function EquipmentDamageAdminView({
	initialReports,
	missingTable,
}: {
	initialReports: EquipmentDamageReportAdminRow[];
	missingTable: boolean;
}): React.ReactElement {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [deletingId, setDeletingId] = useState<string | null>(null);

	function handleDelete(id: string): void {
		setDeletingId(id);
		startTransition(() => {
			void (async () => {
				const r = await deleteEquipmentDamageReportAdminAction({
					reportId: id,
				});
				setDeletingId(null);
				if (r.ok) {
					toast.success("Reporte eliminado");
					router.refresh();
					return;
				}
				toast.error(r.error);
			})();
		});
	}

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
					Averías de equipamiento
				</h1>
				<p className="mt-1 max-w-2xl text-sm text-slate-500">
					Mismo listado que ven los socios en Comunidad: actualiza el estado y
					una nota opcional; el autor recibe push si tiene notificaciones
					activas. Borra solo si fue un error o spam.
				</p>
			</div>

			{missingTable ? (
				<div className="rounded-xl border border-amber-500/30 bg-amber-950/25 p-6 text-sm text-amber-100/90">
					La tabla{" "}
					<code className="rounded bg-black/40 px-1.5 py-0.5">
						equipment_damage_reports
					</code>{" "}
					no existe. Ejecuta{" "}
					<code className="rounded bg-black/40 px-1.5 py-0.5">
						npm run db:migrate
					</code>
					.
				</div>
			) : initialReports.length === 0 ? (
				<div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/50 px-6 py-16 text-center">
					<AlertTriangle className="h-10 w-10 text-slate-600" aria-hidden />
					<p className="text-sm text-slate-500">
						Aún no hay reportes de averías. Aparecerán aquí cuando los socios
						los envíen desde Comunidad.
					</p>
				</div>
			) : (
				<ul className="space-y-5">
					{initialReports.map((row) => (
						<li
							key={row.id}
							className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/50"
						>
							<div className="border-b border-slate-800/80 p-4 sm:flex sm:items-start sm:justify-between sm:gap-4">
								<div className="min-w-0 space-y-2">
									<div className="flex flex-wrap items-center gap-2">
										<span className="text-lg font-semibold text-amber-200/95">
											{row.machineName}
										</span>
										<span
											className={cn(
												"rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
												reportPriorityBadgeClass(row.priority),
											)}
										>
											Prioridad {reportPriorityLabelEs(row.priority)}
										</span>
										<span
											className={cn(
												"rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
												equipmentReportStatusBadgeClass(row.status),
											)}
										>
											{equipmentReportStatusLabelEs(row.status)}
										</span>
									</div>
									<p className="text-xs text-slate-500">
										Recibido {formatDateTime(row.createdAt)}
										{row.updatedAt.getTime() !== row.createdAt.getTime()
											? ` · Actualizado ${formatDateTime(row.updatedAt)}`
											: null}
									</p>
									<p className="text-sm text-slate-300">
										<span className="font-medium text-slate-400">Socio: </span>@
										{row.username}{" "}
										<span className="text-slate-500">({row.email})</span>
									</p>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className={cn(
										"mt-2 shrink-0 text-slate-500 hover:bg-red-950/40 hover:text-red-400 sm:mt-0",
										deletingId === row.id && "opacity-50",
									)}
									disabled={pending}
									aria-label="Eliminar reporte"
									onClick={() => handleDelete(row.id)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
							<div className="p-4">
								<p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
									Descripción del socio
								</p>
								<p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
									{row.message}
								</p>
								<EquipmentReportStaffControls
									key={`${row.id}-${row.updatedAt.toISOString()}`}
									report={row}
								/>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
