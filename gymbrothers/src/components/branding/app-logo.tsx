"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

/** Logo principal (public/icons/image.png). */
export const APP_LOGO_SRC = "/icons/image.png";

const sizeClass = {
	sm: "h-7 w-auto max-w-[120px] md:h-8",
	md: "h-8 w-auto max-w-[160px] md:h-10",
	lg: "h-10 w-auto max-w-[200px] md:h-12",
	xl: "h-12 w-auto max-w-[260px] sm:h-14",
} as const;

export interface AppLogoProps {
	className?: string;
	size?: keyof typeof sizeClass;
	/** Si se define, envuelve el logo en un enlace (p. ej. inicio del portal). */
	href?: string;
	priority?: boolean;
}

export function AppLogo({
	className,
	size = "md",
	href,
	priority = false,
}: AppLogoProps): React.ReactElement {
	const img = (
		<Image
			src={APP_LOGO_SRC}
			alt="GYM BROTHERS"
			width={480}
			height={160}
			className={cn("object-contain object-left", sizeClass[size], className)}
			priority={priority}
			sizes="(max-width: 768px) 200px, 260px"
		/>
	);

	if (href) {
		return (
			<Link href={href} className="inline-flex shrink-0 items-center">
				{img}
			</Link>
		);
	}

	return <span className="inline-flex shrink-0 items-center">{img}</span>;
}
