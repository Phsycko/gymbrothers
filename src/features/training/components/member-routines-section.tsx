"use client";

import { ListOrdered, Repeat } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/server/db/schema/gym-schema";
import type { RoutineWithExerciseIds } from "@/features/training/lib/get-training-data";

import { ExerciseDetailModal } from "./exercise-detail-modal";

const levelLabel: Record<RoutineWithExerciseIds["level"], string> = {
	beginner: "Principiante",
	pro: "Pro",
};

export function MemberRoutinesSection({
	routines,
	exercisesById,
}: {
	routines: RoutineWithExerciseIds[];
	exercisesById: Map<string, Exercise>;
}): React.ReactElement | null {
	const [routineOpen, setRoutineOpen] = useState<RoutineWithExerciseIds | null>(
		null,
	);
	const [exerciseOpen, setExerciseOpen] = useState<Exercise | null>(null);
	const [detailOpen, setDetailOpen] = useState(false);

	const orderedExercises = useMemo(() => {
		if (!routineOpen) {
			return [];
		}
		return routineOpen.exerciseIds
			.map((id) => exercisesById.get(id))
			.filter((e): e is Exercise => Boolean(e));
	}, [routineOpen, exercisesById]);

	if (routines.length === 0) {
		return null;
	}

	return (
		<section className="space-y-4" aria-label="Rutinas">
			<div className="flex items-center justify-between gap-2">
				<h2 className="text-lg font-bold text-white">Rutinas</h2>
				<Repeat className="h-4 w-4 text-[#E11D48]" aria-hidden />
			</div>
			<div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
				{routines.map((r) => (
					<button
						key={r.id}
						type="button"
						onClick={() => setRoutineOpen(r)}
						className={cn(
							"min-w-[220px] shrink-0 rounded-2xl border border-white/10 bg-red-600/10 p-4 text-left transition-all",
							"hover:border-[#E11D48]/40 hover:shadow-[0_0_20px_rgba(225,29,72,0.12)]",
						)}
					>
						<p className="text-[10px] font-bold uppercase tracking-wider text-[#E11D48]">
							{levelLabel[r.level]}
						</p>
						<p className="mt-1 font-semibold text-white">{r.name}</p>
						{r.description ? (
							<p className="mt-2 line-clamp-2 text-xs text-white/50">
								{r.description}
							</p>
						) : null}
					</button>
				))}
			</div>

			<Dialog open={routineOpen != null} onOpenChange={(o) => !o && setRoutineOpen(null)}>
				<DialogContent className="max-h-[85vh] overflow-y-auto border-white/10 bg-black text-white sm:max-w-lg">
					<DialogHeader>
						<DialogTitle className="text-left">
							{routineOpen?.name}
						</DialogTitle>
						{routineOpen?.description ? (
							<p className="text-left text-sm text-white/60">
								{routineOpen.description}
							</p>
						) : null}
					</DialogHeader>
					<ol className="space-y-2">
						{orderedExercises.length === 0 ? (
							<li className="text-sm text-white/50">
								Esta rutina aún no tiene ejercicios asignados.
							</li>
						) : (
							orderedExercises.map((ex, i) => (
								<li
									key={ex.id}
									className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-red-600/10 px-3 py-2"
								>
									<div className="flex min-w-0 items-center gap-2">
										<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/50 text-xs font-bold text-[#E11D48]">
											{i + 1}
										</span>
										<span className="truncate text-sm font-medium text-white">
											{ex.name}
										</span>
									</div>
									<Button
										type="button"
										size="sm"
										variant="outline"
										className="shrink-0 border-[#E11D48]/40 text-xs text-[#E11D48]"
										onClick={() => {
											setRoutineOpen(null);
											setExerciseOpen(ex);
											setDetailOpen(true);
										}}
									>
										<ListOrdered className="mr-1 h-3.5 w-3.5" />
										Ver
									</Button>
								</li>
							))
						)}
					</ol>
				</DialogContent>
			</Dialog>

			<ExerciseDetailModal
				exercise={exerciseOpen}
				open={detailOpen}
				onOpenChange={(o) => {
					setDetailOpen(o);
					if (!o) {
						setExerciseOpen(null);
					}
				}}
			/>
		</section>
	);
}
