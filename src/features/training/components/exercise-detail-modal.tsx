"use client";

import { Play } from "lucide-react";
import { useEffect, useId, useState } from "react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { LottiePlayer } from "@/features/training/components/lottie-player";
import { parseLottieJsonString } from "@/features/training/lib/parse-lottie-json";
import { resolveVideoEmbed } from "@/features/training/lib/video-embed";
import type { Exercise } from "@/server/db/schema/gym-schema";
import { muscleGroupLabelEs } from "@/features/training/lib/muscle-labels";

export function ExerciseDetailModal({
	exercise,
	open,
	onOpenChange,
}: {
	exercise: Exercise | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}): React.ReactElement {
	const [mountVideo, setMountVideo] = useState(false);
	const titleId = useId();

	useEffect(() => {
		if (open) {
			setMountVideo(true);
		} else {
			const t = window.setTimeout(() => setMountVideo(false), 300);
			return () => window.clearTimeout(t);
		}
	}, [open]);

	if (!exercise) {
		return <></>;
	}

	const lottieParsed = parseLottieJsonString(exercise.lottieJson);
	const hasStoredLottie = lottieParsed !== null;
	const embed =
		exercise.videoUrl.trim().length > 0
			? resolveVideoEmbed(exercise.videoUrl, exercise.name)
			: null;

	const showVideo = !hasStoredLottie && embed;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="max-h-[min(92vh,900px)] overflow-y-auto border-white/10 bg-black text-white sm:max-w-2xl"
				aria-labelledby={titleId}
			>
				<DialogHeader>
					<p className="text-xs font-semibold uppercase tracking-wider text-[#E11D48]">
						{muscleGroupLabelEs[exercise.muscleGroup]}
					</p>
					<DialogTitle id={titleId} className="text-left text-xl text-white">
						{exercise.name}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					{hasStoredLottie && lottieParsed ? (
						<div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-black">
							<div className="mx-auto max-w-md">
								<LottiePlayer
									animationData={lottieParsed}
									priority
									className="aspect-square w-full max-h-[min(52vh,420px)]"
									intenseRedTint
								/>
							</div>
						</div>
					) : (
						<div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
							{mountVideo && showVideo && embed ? (
								<iframe
									title={embed.title}
									src={embed.embedSrc}
									className="absolute inset-0 h-full w-full"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
									allowFullScreen
									loading="lazy"
									referrerPolicy="strict-origin-when-cross-origin"
								/>
							) : (
								<div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 px-4 text-center text-white/50">
									<Play className="h-10 w-10 shrink-0" aria-hidden />
									<span className="text-sm">
										{exercise.videoUrl.trim()
											? "Cargando reproductor…"
											: "Sin animación Lottie ni video — el staff puede añadir JSON o URL desde admin."}
									</span>
								</div>
							)}
						</div>
					)}

					{exercise.description ? (
						<p className="text-sm leading-relaxed text-white/75">
							{exercise.description}
						</p>
					) : null}

					<div className="rounded-xl border border-[#E11D48]/25 bg-red-600/10 p-4">
						<h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#E11D48]">
							Tips de los Brothers
						</h3>
						<p className="whitespace-pre-wrap text-sm leading-relaxed text-white/85">
							{exercise.formTips.trim()
								? exercise.formTips
								: "Sin tips aún — el staff puede añadir notas de ejecución desde el panel."}
						</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
