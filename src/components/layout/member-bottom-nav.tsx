"use client";

import { Bell, Dumbbell, Home, Shield, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS: {
	href: string;
	label: string;
	icon: typeof Home;
}[] = [
	{ href: "/dashboard/member", label: "Inicio", icon: Home },
	{ href: "/dashboard/member/training", label: "Entreno", icon: Dumbbell },
	{ href: "/dashboard/member/community", label: "Comunidad", icon: Bell },
	{ href: "/dashboard/member/security", label: "Seguridad", icon: Shield },
	{ href: "/dashboard/member/profile", label: "Perfil", icon: User },
];

export function MemberBottomNav(): React.ReactElement {
	const pathname = usePathname();
	return (
		<nav
			className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg"
			aria-label="Navegación principal"
		>
			<div className="no-scrollbar mx-auto flex max-w-lg min-w-0 items-stretch justify-start gap-1 overflow-x-auto px-2 pt-2 md:max-w-2xl md:justify-around">
				{TABS.map(({ href, label, icon: Icon }) => {
					const active =
						href === "/dashboard/member"
							? pathname === href
							: pathname === href || pathname.startsWith(`${href}/`);
					return (
						<Link
							key={href}
							href={href}
							prefetch
							className={cn(
								"flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors",
								active
									? "text-[#E11D48]"
									: "text-white/45 hover:text-white/80",
							)}
						>
							<Icon
								className={cn(
									"h-6 w-6 shrink-0",
									active ? "text-[#E11D48]" : "text-white/50",
								)}
								strokeWidth={active ? 2.5 : 2}
								aria-hidden
							/>
							<span className="truncate">{label}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
