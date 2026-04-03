"use client";

import { MessageSquarePlus, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitExerciseRequestAction } from "@/features/member-portal/actions/community-actions";
import type { ExerciseRequestRow } from "@/features/member-portal/lib/get-exercise-requests";
import { cn } from "@/lib/utils";

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

export function ExerciseRequestBoard({
	initialRequests,
	currentUserId,
	missingTable,
}: {
	initialRequests: ExerciseRequestRow[];
	currentUserId: string;
	missingTable: boolean;
}): React.ReactElement {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [message, setMessage] = useState("");

	function onSubmit(e: React.FormEvent): void {
		e.preventDefault();
		const trimmed = message.trim();
		if (trimmed.length < 3) {
			toast.error("Escribe al menos 3 caracteres.");
			return;
		}
		startTransition(() => {
			void (async () => {
				const r = await submitExerciseRequestAction({ message: trimmed });
				if (r.ok) {
					toast.success("Solicitud publicada. El staff la revisará.");
					setMessage("");
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
				El tablón de solicitudes aún no está disponible en el servidor. Avísale
				al staff para aplicar la migración de base de datos.
			</div>
		);
	}

	return (
		<section
			className="rounded-2xl border border-[#E11D48]/20 bg-gradient-to-b from-red-950/25 to-black/40 p-5 backdrop-blur-xl sm:p-6"
			aria-labelledby="exercise-requests-heading"
		>
			<div className="mb-4 flex items-start gap-3">
				<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E11D48]/15 ring-1 ring-[#E11D48]/35">
					<MessageSquarePlus className="h-5 w-5 text-[#E11D48]" aria-hidden />
				</div>
				<div className="min-w-0">
					<h2
						id="exercise-requests-heading"
						className="text-lg font-semibold tracking-tight text-white"
					>
						Solicitudes de ejercicios
					</h2>
					<p className="mt-1 text-sm leading-relaxed text-white/55">
						Pide un ejercicio que te gustaría ver en la app. Otros brothers
						verán tu idea y el equipo podrá priorizarla.
					</p>
				</div>
			</div>

			<form onSubmit={onSubmit} className="space-y-3">
				<Textarea
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					placeholder='Ej.: "Remo en máquina T-bar" o grupo muscular y variante'
					maxLength={500}
					rows={3}
					disabled={pending}
					className={cn(
						"resize-none border-white/10 bg-black/50 text-sm text-white placeholder:text-white/35",
						"focus-visible:border-[#E11D48]/60 focus-visible:ring-[#E11D48]/30",
					)}
					aria-label="Texto de la solicitud de ejercicio"
				/>
				<div className="flex flex-wrap items-center justify-between gap-2">
					<span className="text-[11px] text-white/35">
						{message.length}/500
					</span>
					<Button
						type="submit"
						size="sm"
						disabled={pending || message.trim().length < 3}
						className="gap-2 bg-[#E11D48] text-white hover:bg-[#BE123C]"
					>
						<Send className="h-4 w-4" aria-hidden />
						{pending ? "Publicando…" : "Publicar solicitud"}
					</Button>
				</div>
			</form>

			<div className="mt-6 border-t border-white/10 pt-5">
				<h3 className="text-[11px] font-bold uppercase tracking-widest text-white/40">
					Recientes
				</h3>
				{initialRequests.length === 0 ? (
					<p className="mt-3 text-sm text-white/45">
						Aún no hay solicitudes. Sé el primero en proponer un ejercicio.
					</p>
				) : (
					<ul className="mt-3 max-h-[min(60vh,420px)] space-y-3 overflow-y-auto pr-1">
						{initialRequests.map((r) => {
							const mine = r.userId === currentUserId;
							return (
								<li
									key={r.id}
									className={cn(
										"rounded-xl border px-3.5 py-3 text-sm",
										mine
											? "border-[#E11D48]/35 bg-[#E11D48]/10"
											: "border-white/10 bg-white/[0.04]",
									)}
								>
									<div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px] text-white/45">
										<span className="flex flex-wrap items-center gap-2">
											<span className="font-medium text-white/70">
												@{r.username}
											</span>
											{mine ? (
												<span className="rounded-full border border-[#E11D48]/40 bg-[#E11D48]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#E11D48]">
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
								</li>
							);
						})}
					</ul>
				)}
			</div>
		</section>
	);
}
