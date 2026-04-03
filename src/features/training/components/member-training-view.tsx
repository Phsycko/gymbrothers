"use client";

import {
	Dumbbell,
	Flame,
	HeartPulse,
	Layers,
	Library,
	Scan,
	Sparkles,
	User,
	Users,
	Wind,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ExerciseCard } from "@/features/training/components/exercise-card";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/server/db/schema/gym-schema";

import {
	MUSCLE_GROUPS,
	type MuscleGroup,
	muscleGroupLabelEs,
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
		<div className="min-w-0 space-y-6 sm:space-y-8">
			<div className="min-w-0">
				<h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
					Entrenamiento
				</h1>
				<p className="mt-1 text-sm text-white/55">
					Videos de referencia por ejercicio. Revisa los tips antes de cargar
					peso.
				</p>
			</div>

			<div className="rounded-2xl border border-[#E11D48]/25 bg-gradient-to-br from-red-950/35 via-black/50 to-black/80 p-4 shadow-lg shadow-black/20 backdrop-blur-sm sm:p-5">
				<div className="flex gap-3 sm:gap-4">
					<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E11D48]/15 ring-1 ring-[#E11D48]/35">
						<Library className="h-5 w-5 text-[#E11D48]" aria-hidden />
					</div>
					<div className="min-w-0 space-y-2">
						<p className="text-sm font-semibold text-white">
							Biblioteca en crecimiento
						</p>
						<p className="text-sm leading-relaxed text-white/65">
							Iremos subiendo más ejercicios con el tiempo. Si echas en falta
							alguno, puedes pedirlo en{" "}
							<span className="font-medium text-white/85">Comunidad</span>: el
							equipo verá las solicitudes y podrá priorizarlas.
						</p>
						<Link
							href="/dashboard/member/community"
							className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#E11D48] underline-offset-4 transition-colors hover:text-[#FB7185] hover:underline"
						>
							Ir a Comunidad
							<span aria-hidden>→</span>
						</Link>
					</div>
				</div>
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
					<div className="grid min-w-0 grid-cols-2 gap-5 md:grid-cols-2 lg:grid-cols-3">
						{filtered.map((ex) => (
							<ExerciseCard key={ex.id} exercise={ex} />
						))}
					</div>
				)}
			</section>
		</div>
	);
}
