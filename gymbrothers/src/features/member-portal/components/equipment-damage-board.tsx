"use client";

import { AlertTriangle, Hammer } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitEquipmentDamageReportAction } from "@/features/member-portal/actions/community-actions";
import {
	type ReportPriority,
	reportPriorityBadgeClass,
	reportPriorityLabelEs,
} from "@/features/member-portal/lib/equipment-report-priority-label";
import {
	equipmentDamageCardClass,
	equipmentReportStatusBadgeClass,
	equipmentReportStatusLabelEs,
} from "@/features/member-portal/lib/equipment-report-status";
import type { EquipmentDamageReportRow } from "@/features/member-portal/lib/get-equipment-damage-reports";
import { GYM_EQUIPMENT_OPTIONS } from "@/features/member-portal/lib/gym-equipment-options";
import { cn } from "@/lib/utils";

const PRIORITIES: { value: ReportPriority; label: string }[] = [
	{ value: "low", label: "Baja" },
	{ value: "medium", label: "Media" },
	{ value: "high", label: "Alta" },
];

function formatRelativeEs(date: Date): string {
	const now = Date.now();
	const diffMs = now - date.getTime();
	const diffMins = Math.floor(diffMs / 60_000);
	if (diffMins < 1) {
		return "hace un momento";
	}
	if (diffMins < 60) {
		return `hace ${diffMins} min`;
	}
	const diffHours = Math.floor(diffMins / 60);
	if (diffHours < 24) {
		return `hace ${diffHours} h`;
	}
	const diffDays = Math.floor(diffHours / 24);
	if (diffDays < 7) {
		return `hace ${diffDays} d`;
	}
	return date.toLocaleDateString("es", { day: "numeric", month: "short" });
}

export function EquipmentDamageBoard({
	initialReports,
	currentUserId,
	missingTable,
}: {
	initialReports: EquipmentDamageReportRow[];
	currentUserId: string;
	missingTable: boolean;
}): React.ReactElement {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [machineName, setMachineName] = useState(
		GYM_EQUIPMENT_OPTIONS[0].value,
	);
	const [message, setMessage] = useState("");
	const [priority, setPriority] = useState<ReportPriority>("medium");

	function resetForm(): void {
		setMachineName(GYM_EQUIPMENT_OPTIONS[0].value);
		setMessage("");
		setPriority("medium");
	}

	function onSubmit(e: React.FormEvent): void {
		e.preventDefault();
		const msg = message.trim();
		if (msg.length < 3) {
			toast.error("Describe el problema con al menos 3 caracteres.");
			return;
		}
		startTransition(() => {
			void (async () => {
				const r = await submitEquipmentDamageReportAction({
					machineName,
					message: msg,
					priority,
				});
				if (r.ok) {
					toast.success("Reporte enviado. El staff recibirá un aviso.");
					resetForm();
					setDialogOpen(false);
					router.refresh();
					return;
				}
				toast.error(r.error);
			})();
		});
	}

	if (missingTable) {
		return (
			<div className="rounded-2xl border border-amber-500/25 bg-amber-950/20 p-5 text-sm text-amber-100/90 backdrop-blur-xl">
				El aviso de averías aún no está disponible en el servidor. Avísale al
				staff para aplicar la migración de base de datos.
			</div>
		);
	}

	return (
		<section
			className="rounded-2xl border border-white/[0.07] bg-gradient-to-b from-zinc-950/80 to-black/60 p-5 backdrop-blur-xl ring-1 ring-white/[0.04] sm:p-6"
			aria-labelledby="equipment-damage-heading"
		>
			<div className="mb-5 flex items-start gap-3">
				<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10">
					<Hammer className="h-5 w-5 text-amber-400" aria-hidden />
				</div>
				<div className="min-w-0 flex-1">
					<h2
						id="equipment-damage-heading"
						className="text-lg font-semibold tracking-tight text-white"
					>
						Averías y equipamiento
					</h2>
					<p className="mt-1 text-sm leading-relaxed text-white/55">
						¿Algo roto o inseguro? El staff actualiza el estado y verás su
						respuesta aquí.
					</p>
					<Button
						type="button"
						onClick={() => setDialogOpen(true)}
						className="mt-4 h-12 w-full border border-[#E11D48]/40 bg-[#E11D48] text-base font-semibold text-white shadow-[0_0_24px_-8px_rgba(225,29,72,0.55)] hover:bg-[#BE123C] sm:w-auto sm:px-8"
					>
						<Hammer className="mr-2 h-5 w-5" aria-hidden />
						Reportar máquina dañada
					</Button>
				</div>
			</div>

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="border border-white/10 bg-zinc-950 text-slate-50 sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-white">Reportar avería</DialogTitle>
						<DialogDescription>
							Elige la máquina, prioridad y describe el problema. Se notificará
							al equipo al instante.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={onSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="eq-machine" className="text-white/70">
								Máquina
							</Label>
							<Select
								value={machineName}
								onValueChange={setMachineName}
								disabled={pending}
							>
								<SelectTrigger
									id="eq-machine"
									className="border-white/10 bg-black/60 text-white"
								>
									<SelectValue placeholder="Selecciona máquina" />
								</SelectTrigger>
								<SelectContent className="border-white/10 bg-zinc-950 text-white">
									{GYM_EQUIPMENT_OPTIONS.map((opt) => (
										<SelectItem key={opt.value} value={opt.value}>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="eq-priority" className="text-white/70">
								Prioridad
							</Label>
							<Select
								value={priority}
								onValueChange={(v) => setPriority(v as ReportPriority)}
								disabled={pending}
							>
								<SelectTrigger
									id="eq-priority"
									className="border-white/10 bg-black/60 text-white"
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="border-white/10 bg-zinc-950 text-white">
									{PRIORITIES.map((p) => (
										<SelectItem key={p.value} value={p.value}>
											{p.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="eq-msg" className="text-white/70">
								Descripción del problema
							</Label>
							<Textarea
								id="eq-msg"
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								placeholder="Qué falla, si hay riesgo, número de máquina si aplica…"
								maxLength={1000}
								rows={4}
								disabled={pending}
								className="resize-none border-white/10 bg-black/60 text-white placeholder:text-white/35"
							/>
							<p className="text-[11px] text-white/35">{message.length}/1000</p>
						</div>
						<DialogFooter className="gap-2 sm:gap-0">
							<Button
								type="button"
								variant="outline"
								className="border-white/15 bg-transparent text-white hover:bg-white/10"
								disabled={pending}
								onClick={() => {
									setDialogOpen(false);
									resetForm();
								}}
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								disabled={pending || message.trim().length < 3}
								className="bg-[#E11D48] text-white hover:bg-[#BE123C]"
							>
								{pending ? "Enviando…" : "Enviar reporte"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<div className="mt-2 border-t border-white/10 pt-5">
				<h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/40">
					<AlertTriangle
						className="h-3.5 w-3.5 text-amber-500/80"
						aria-hidden
					/>
					Reportes recientes
				</h3>
				{initialReports.length === 0 ? (
					<p className="mt-3 text-sm text-white/45">
						Aún no hay reportes públicos. Usa el botón de arriba si ves algo
						raro.
					</p>
				) : (
					<ul className="mt-3 max-h-[min(60vh,420px)] space-y-3 overflow-y-auto pr-1">
						{initialReports.map((r) => {
							const mine = r.userId === currentUserId;
							return (
								<li
									key={r.id}
									className={equipmentDamageCardClass(r.status, mine)}
								>
									<div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px] text-white/45">
										<span className="flex flex-wrap items-center gap-2">
											<span className="font-semibold text-amber-200/90">
												{r.machineName}
											</span>
											<span
												className={cn(
													"rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
													reportPriorityBadgeClass(r.priority),
												)}
											>
												{reportPriorityLabelEs(r.priority)}
											</span>
											<span
												className={cn(
													"rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
													equipmentReportStatusBadgeClass(r.status),
												)}
											>
												{equipmentReportStatusLabelEs(r.status)}
											</span>
											<span className="text-white/25">·</span>
											<span className="font-medium text-white/70">
												@{r.username}
											</span>
											{mine ? (
												<span className="rounded-full border border-[#E11D48]/40 bg-[#E11D48]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#FB7185]">
													Tú
												</span>
											) : null}
										</span>
										<span className="tabular-nums">
											{formatRelativeEs(r.createdAt)}
										</span>
									</div>
									<p className="mt-2 whitespace-pre-wrap leading-relaxed text-white/85">
										{r.message}
									</p>
									{r.staffNote ? (
										<div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-950/25 px-3 py-2.5">
											<p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-400/90">
												Equipo
											</p>
											<p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-emerald-100/95">
												{r.staffNote}
											</p>
										</div>
									) : null}
								</li>
							);
						})}
					</ul>
				)}
			</div>
		</section>
	);
}
