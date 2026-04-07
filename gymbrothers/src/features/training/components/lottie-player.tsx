"use client";

import type { LottieRefCurrentProps } from "lottie-react";
import Lottie from "lottie-react";
import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface LottiePlayerProps {
	animationData: object;
	className?: string;
	priority?: boolean;
	loop?: boolean;
	intenseRedTint?: boolean;
}

export function LottiePlayer({
	animationData,
	className,
	priority = false,
	loop = true,
	intenseRedTint = true,
}: LottiePlayerProps): React.ReactElement {
	const containerRef = useRef<HTMLDivElement>(null);
	const lottieRef = useRef<LottieRefCurrentProps | null>(null);
	const [inView, setInView] = useState(priority);
	const [paused, setPaused] = useState(false);
	const [touchUi, setTouchUi] = useState(false);

	useEffect(() => {
		if (priority) {
			setInView(true);
			return;
		}
		const el = containerRef.current;
		if (!el) {
			return;
		}
		const io = new IntersectionObserver(
			([e]) => {
				if (e?.isIntersecting) {
					setInView(true);
				}
			},
			{ rootMargin: "120px", threshold: 0.01 },
		);
		io.observe(el);
		return () => io.disconnect();
	}, [priority]);

	useEffect(() => {
		if (!lottieRef.current || !inView) {
			return;
		}
		if (paused) {
			lottieRef.current.pause();
		} else {
			lottieRef.current.play();
		}
	}, [paused, inView]);

	const toggle = useCallback(() => {
		setPaused((p) => !p);
	}, []);

	return (
		<div
			ref={containerRef}
			className={cn(
				"group relative isolate overflow-hidden rounded-xl bg-black/60",
				intenseRedTint &&
					"[&_svg]:brightness-110 [&_svg]:contrast-110 [&_svg]:drop-shadow-[0_0_12px_rgba(225,29,72,0.45)]",
				className,
			)}
			onMouseEnter={() => setTouchUi(false)}
			onTouchStart={() => setTouchUi(true)}
		>
			{inView ? (
				<Lottie
					lottieRef={lottieRef}
					animationData={animationData}
					loop={loop}
					autoplay
					className="h-full w-full [&_svg]:h-full [&_svg]:w-full"
					rendererSettings={{
						preserveAspectRatio: "xMidYMid meet",
					}}
				/>
			) : (
				<div className="flex aspect-square w-full items-center justify-center bg-black/40">
					<div className="h-8 w-8 animate-pulse rounded-full bg-[#E11D48]/30" />
				</div>
			)}

			<div
				className={cn(
					"absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/80 via-black/20 to-transparent pb-2 pt-8 transition-opacity duration-200",
					"opacity-0 group-hover:opacity-100",
					touchUi && "opacity-100",
				)}
			>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						toggle();
					}}
					className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/70 text-white backdrop-blur-sm transition-colors hover:border-[#E11D48]/60 hover:bg-[#E11D48]/25"
					aria-label={paused ? "Reproducir animación" : "Pausar animación"}
				>
					{paused ? (
						<Play className="h-5 w-5 text-[#E11D48]" />
					) : (
						<Pause className="h-5 w-5" />
					)}
				</button>
			</div>
		</div>
	);
}
