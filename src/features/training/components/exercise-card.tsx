"use client";

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getYouTubeEmbedUrl } from "@/lib/utils/video-helpers";
import type { Exercise } from "@/server/db/schema/gym-schema";

import { muscleGroupLabelEs } from "@/features/training/lib/muscle-labels";

const IFRAME_ALLOW =
	"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";

export function ExerciseCard({
	exercise,
	className,
}: {
	exercise: Exercise;
	className?: string;
}): React.ReactElement {
	const embedSrc = getYouTubeEmbedUrl(exercise.videoUrl ?? "");
	const desc = exercise.description.trim();
	const tips = exercise.formTips.trim();

	return (
		<Card
			className={cn(
				"overflow-hidden border-slate-800 bg-slate-950 transition-colors duration-300 hover:border-red-600/50",
				className,
			)}
		>
			<CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-3">
				<CardTitle className="text-left text-base font-bold leading-snug text-white">
					{exercise.name}
				</CardTitle>
				<Badge
					variant="outline"
					className="shrink-0 border-[#E11D48]/45 bg-[#E11D48]/10 text-[11px] font-semibold uppercase tracking-wide text-[#E11D48]"
				>
					{muscleGroupLabelEs[exercise.muscleGroup]}
				</Badge>
			</CardHeader>

			<CardContent className="px-4 pb-3 pt-0">
				<div className="aspect-video w-full overflow-hidden rounded-md bg-black ring-1 ring-white/10">
					{embedSrc ? (
						<iframe
							title={`Video: ${exercise.name}`}
							src={embedSrc}
							className="h-full w-full border-0"
							allow={IFRAME_ALLOW}
							allowFullScreen
							loading="lazy"
							referrerPolicy="strict-origin-when-cross-origin"
						/>
					) : (
						<div className="flex h-full min-h-[120px] items-center justify-center px-4 text-center text-sm text-slate-500">
							Enlace de YouTube no válido o vacío. Edita el ejercicio en admin.
						</div>
					)}
				</div>
			</CardContent>

			<CardFooter className="flex flex-col items-stretch gap-2 border-t border-slate-800/80 p-4 pt-3">
				{desc ? (
					<p className="text-sm leading-relaxed text-slate-400">{desc}</p>
				) : null}
				<p className="text-sm leading-relaxed text-slate-400">
					<span className="font-semibold text-slate-300">Form tips: </span>
					{tips || (
						<span className="text-slate-500">
							Sin tips aún — añádelos desde el panel admin.
						</span>
					)}
				</p>
			</CardFooter>
		</Card>
	);
}
