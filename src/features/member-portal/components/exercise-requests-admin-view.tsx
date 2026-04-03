"use client";

import { MessageSquare, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { deleteExerciseRequestAdminAction } from "@/features/member-portal/actions/exercise-request-admin-actions";
import type { ExerciseRequestAdminRow } from "@/features/member-portal/lib/get-exercise-requests";
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

export function ExerciseRequestsAdminView({
	initialRequests,
	missingTable,
}: {
	initialRequests: ExerciseRequestAdminRow[];
	missingTable: boolean;
}): React.ReactElement {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [deletingId, setDeletingId] = useState<string | null>(null);

	function handleDelete(id: string): void {
		setDeletingId(id);
		startTransition(() => {
			void (async () => {
				const r = await deleteExerciseRequestAdminAction({ requestId: id });
				setDeletingId(null);
				if (r.ok) {
					toast.success("Solicitud eliminada");
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
					Solicitudes de ejercicios
				</h1>
				<p className="mt-1 max-w-2xl text-sm text-slate-500">
					Peticiones desde Comunidad en la app de socios. Elimina las que ya
					hayas añadido a la biblioteca o descartes.
				</p>
			</div>

			{missingTable ? (
				<div className="rounded-xl border border-amber-500/30 bg-amber-950/25 p-6 text-sm text-amber-100/90">
					La tabla{" "}
					<code className="rounded bg-black/40 px-1.5 py-0.5">
						exercise_requests
					</code>{" "}
					no existe. Ejecuta{" "}
					<code className="rounded bg-black/40 px-1.5 py-0.5">
						npm run db:migrate
					</code>
					.
				</div>
			) : initialRequests.length === 0 ? (
				<div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/50 px-6 py-16 text-center">
					<MessageSquare className="h-10 w-10 text-slate-600" aria-hidden />
					<p className="text-sm text-slate-500">
						Aún no hay solicitudes. Aparecerán aquí cuando los socios publiquen
						en Comunidad.
					</p>
				</div>
			) : (
				<div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/50">
					<div className="no-scrollbar overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow className="border-slate-800 hover:bg-transparent">
									<TableHead className="min-w-[140px] text-slate-400">
										Fecha
									</TableHead>
									<TableHead className="min-w-[120px] text-slate-400">
										Usuario
									</TableHead>
									<TableHead className="min-w-[200px] text-slate-400">
										Email
									</TableHead>
									<TableHead className="min-w-[280px] text-slate-400">
										Mensaje
									</TableHead>
									<TableHead className="w-[100px] text-right text-slate-400">
										Acciones
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{initialRequests.map((row) => (
									<TableRow
										key={row.id}
										className="border-slate-800/80 hover:bg-slate-900/50"
									>
										<TableCell className="align-top text-xs tabular-nums text-slate-400">
											{formatDateTime(row.createdAt)}
										</TableCell>
										<TableCell className="align-top font-medium text-slate-200">
											@{row.username}
										</TableCell>
										<TableCell className="align-top text-xs text-slate-400">
											{row.email}
										</TableCell>
										<TableCell className="align-top text-sm text-slate-300">
											<p className="whitespace-pre-wrap leading-relaxed">
												{row.message}
											</p>
										</TableCell>
										<TableCell className="align-top text-right">
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className={cn(
													"text-slate-500 hover:bg-red-950/40 hover:text-red-400",
													deletingId === row.id && "opacity-50",
												)}
												disabled={pending}
												aria-label="Eliminar solicitud"
												onClick={() => handleDelete(row.id)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>
			)}
		</div>
	);
}
