"use client";

import { AlertTriangle, Play } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getYouTubeEmbedUrl } from "@/lib/utils/video-helpers";
import type { Exercise } from "@/server/db/schema/gym-schema";

import { muscleGroupLabelEs } from "@/features/training/lib/muscle-labels";

const DEFAULT_COVER = "/images/muscle-map-cover-default.svg";

const IFRAME_ALLOW =
	"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";

export function ExerciseCard({
	exercise,
	className,
}: {
	exercise: Exercise;
	className?: string;
}): React.ReactElement {
	const [open, setOpen] = useState(false);
	const coverSrc = exercise.coverImageUrl?.trim() || DEFAULT_COVER;
	const embedSrc = getYouTubeEmbedUrl(exercise.videoUrl ?? "");
	const desc = exercise.description.trim();
	const tips = exercise.formTips.trim();
	const groupLabel = muscleGroupLabelEs[exercise.muscleGroup];

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className={cn(
					"group relative w-full min-w-0 cursor-pointer overflow-hidden rounded-lg text-left",
					"ring-1 ring-white/10 transition-all duration-200",
					"hover:ring-[#E11D48]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48] focus-visible:ring-offset-2 focus-visible:ring-offset-black",
					className,
				)}
			>
				<div className="relative aspect-[3/4] w-full bg-black">
					<img
						src={coverSrc}
						alt=""
						className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
						loading="lazy"
						decoding="async"
					/>
					<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

					{/* Play — center */}
					<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
						<div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/55 shadow-lg ring-2 ring-white/25 backdrop-blur-[2px] transition-transform duration-200 group-hover:scale-110 group-hover:ring-[#E11D48]/60">
							<Play
								className="ml-0.5 h-7 w-7 text-white drop-shadow-md"
								strokeWidth={1.75}
								aria-hidden
							/>
						</div>
					</div>

					{/* Title + category — bottom overlay */}
					<div className="pointer-events-none absolute inset-x-0 bottom-0 px-2 pb-2 pt-10">
						<p className="line-clamp-2 text-xs font-bold leading-tight text-white drop-shadow-md sm:text-sm">
							{exercise.name}
						</p>
						<Badge
							variant="outline"
							className="mt-1 border-[#E11D48]/55 bg-black/55 px-1.5 py-0 text-[9px] font-bold uppercase tracking-wider text-[#E11D48] backdrop-blur-sm"
						>
							{groupLabel}
						</Badge>
					</div>
				</div>
			</button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent
					className={cn(
						"max-h-[min(92vh,880px)] max-w-[min(96vw,640px)] overflow-y-auto border-white/15",
						"bg-black/85 p-0 shadow-2xl backdrop-blur-xl",
					)}
					onOpenAutoFocus={(e) => e.preventDefault()}
				>
					{open ? (
						<div className="flex flex-col">
							<div className="relative aspect-video w-full bg-black">
								{embedSrc ? (
									<iframe
										title={`Video: ${exercise.name}`}
										src={embedSrc}
										className="absolute inset-0 h-full w-full border-0"
										allow={IFRAME_ALLOW}
										allowFullScreen
										referrerPolicy="strict-origin-when-cross-origin"
									/>
								) : (
									<div className="flex h-full min-h-[160px] flex-col items-center justify-center gap-2 px-4 text-center">
										<AlertTriangle
											className="h-10 w-10 text-amber-500/90"
											aria-hidden
										/>
										<p className="text-xs text-slate-400">
											No hay un enlace de YouTube válido. Añade uno desde el panel
											admin.
										</p>
									</div>
								)}
							</div>

							<div className="space-y-3 border-t border-white/10 p-4 sm:p-5">
								<DialogHeader className="space-y-1 text-left">
									<DialogTitle className="text-xl font-bold tracking-tight text-[#E11D48] sm:text-2xl">
										{exercise.name}
									</DialogTitle>
									<p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
										{groupLabel}
									</p>
								</DialogHeader>

								{desc ? (
									<p className="text-sm leading-relaxed text-slate-300">{desc}</p>
								) : null}

								<div className="rounded-lg border border-[#E11D48]/20 bg-red-600/10 px-3 py-2.5">
									<p className="text-[10px] font-bold uppercase tracking-wide text-[#E11D48]">
										Form tips — Brothers
									</p>
									<p className="mt-1 text-xs leading-relaxed text-slate-300 sm:text-sm">
										{tips || (
											<span className="text-slate-500">
												Sin tips aún — el staff puede añadirlos en admin.
											</span>
										)}
									</p>
								</div>
							</div>
						</div>
					) : null}
				</DialogContent>
			</Dialog>
		</>
	);
}
