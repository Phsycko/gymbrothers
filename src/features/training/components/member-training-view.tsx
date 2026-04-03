"use client";

import {
	Dumbbell,
	Flame,
	HeartPulse,
	Layers,
	Scan,
	Sparkles,
	User,
	Users,
	Wind,
} from "lucide-react";
import { useMemo, useState } from "react";

import { ExerciseCard } from "@/features/training/components/exercise-card";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/server/db/schema/gym-schema";

import {
	MUSCLE_GROUPS,
	muscleGroupLabelEs,
	type MuscleGroup,
} from "@/features/training/lib/muscle-labels";

const MUSCLE_ICONS: Record<MuscleGroup, typeof Dumbbell> = {
	chest: HeartPulse,
	back: Layers,
	legs: User,
	shoulders: Dumbbell,
	arms: Sparkles,
	core: Wind,
	cardio: Flame,
	fullbody: Users,
};

export function MemberTrainingView({
	exercises,
}: {
	exercises: Exercise[];
}): React.ReactElement {
	const [group, setGroup] = useState<MuscleGroup | "all">("all");

	const filtered = useMemo(() => {
		if (group === "all") {
			return exercises;
		}
		return exercises.filter((e) => e.muscleGroup === group);
	}, [exercises, group]);

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-white">
					Entrenamiento
				</h1>
				<p className="mt-1 text-sm text-white/55">
					Videos de referencia por ejercicio. Revisa los tips antes de cargar peso.
				</p>
			</div>

			<section aria-label="Grupos musculares">
				<div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
					<button
						type="button"
						onClick={() => setGroup("all")}
						className={cn(
							"flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors",
							group === "all"
								? "border-[#E11D48] bg-red-600/20 text-white"
								: "border-white/10 bg-white/5 text-white/70 hover:border-white/25",
						)}
					>
						<Scan className="h-4 w-4" />
						Todos
					</button>
					{MUSCLE_GROUPS.map((mg) => {
						const Icon = MUSCLE_ICONS[mg];
						const active = group === mg;
						return (
							<button
								key={mg}
								type="button"
								onClick={() => setGroup(mg)}
								className={cn(
									"flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors",
									active
										? "border-[#E11D48] bg-red-600/20 text-white"
										: "border-white/10 bg-white/5 text-white/70 hover:border-white/25",
								)}
							>
								<Icon className="h-4 w-4 shrink-0" aria-hidden />
								{muscleGroupLabelEs[mg]}
							</button>
						);
					})}
				</div>
			</section>

			<section aria-label="Ejercicios">
				{filtered.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/80 px-6 py-14 text-center text-sm text-slate-500">
						No hay ejercicios en esta categoría todavía.
					</div>
				) : (
					<div className="grid min-w-0 grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
						{filtered.map((ex) => (
							<ExerciseCard key={ex.id} exercise={ex} />
						))}
					</div>
				)}
			</section>
		</div>
	);
}
