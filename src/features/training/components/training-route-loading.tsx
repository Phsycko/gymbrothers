"use client";

import Lottie from "lottie-react";

import loadingBrother from "@/features/training/assets/loading-brother.json";

export function TrainingRouteLoading(): React.ReactElement {
	return (
		<div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 py-16">
			<div className="h-36 w-36 [&_svg]:h-full [&_svg]:w-full">
				<Lottie
					animationData={loadingBrother}
					loop
					autoplay
					rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
				/>
			</div>
			<p className="text-sm font-medium text-white/55">Cargando hermanos…</p>
		</div>
	);
}
