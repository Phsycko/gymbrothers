import type { ReactNode } from "react";

/**
 * Shared shell for auth routes: deep black canvas, crimson radial depth, pulsing accent glow.
 */
export default function AuthLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>): React.ReactElement {
	return (
		<div className="relative min-h-screen overflow-hidden bg-black">
			{/* Base depth: center crimson → pure black edges */}
			<div
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-5%,#1a0000_0%,#000000_65%,#000000_100%)]"
				aria-hidden
			/>
			{/* High-energy pulsing glow — top-center cluster */}
			<div
				className="pointer-events-none absolute left-1/2 top-0 h-[min(50vh,28rem)] w-[min(100%,48rem)] -translate-x-1/2 animate-auth-glow-pulse rounded-full bg-[#E11D48]/25 blur-[100px]"
				aria-hidden
			/>
			<div
				className="pointer-events-none absolute -left-24 top-12 h-72 w-72 animate-auth-glow-flicker rounded-full bg-[#FF0000]/15 blur-[80px]"
				aria-hidden
			/>
			<div className="relative z-10">{children}</div>
		</div>
	);
}
