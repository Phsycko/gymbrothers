"use client";

import {
	CreditCard,
	Dumbbell,
	LayoutDashboard,
	Megaphone,
	Menu,
	MessageSquare,
	Settings,
	Users,
	Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { AppLogo } from "@/components/branding/app-logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV: { href: string; label: string; icon: typeof LayoutDashboard }[] = [
	{ href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
	{ href: "/dashboard/members", label: "Socios", icon: Users },
	{
		href: "/dashboard/admin/training",
		label: "Entrenamiento",
		icon: Dumbbell,
	},
	{
		href: "/dashboard/exercise-requests",
		label: "Solicitudes",
		icon: MessageSquare,
	},
	{
		href: "/dashboard/subscription-plans",
		label: "Planes",
		icon: CreditCard,
	},
	{ href: "/dashboard/payments", label: "Pagos", icon: Wallet },
	{ href: "/dashboard/announcements", label: "Anuncios", icon: Megaphone },
	{ href: "/dashboard/settings", label: "Ajustes", icon: Settings },
];

function NavLinks({
	onNavigate,
	className,
}: {
	onNavigate?: () => void;
	className?: string;
}): React.ReactElement {
	const pathname = usePathname();
	return (
		<nav className={cn("flex flex-col gap-1 p-2", className)}>
			{NAV.map((item) => {
				const active =
					pathname === item.href ||
					(item.href !== "/dashboard" && pathname.startsWith(item.href));
				const Icon = item.icon;
				return (
					<Link
						key={item.href}
						href={item.href}
						prefetch
						onClick={onNavigate}
						className={cn(
							"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
							active
								? "bg-[#E11D48]/12 text-red-400 shadow-[inset_0_0_0_1px_rgba(225,29,72,0.35)]"
								: "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100",
						)}
					>
						<Icon className="h-4 w-4 shrink-0" />
						{item.label}
					</Link>
				);
			})}
		</nav>
	);
}

export function DashboardSidebar(): React.ReactElement {
	const [open, setOpen] = useState(false);
	return (
		<>
			<div className="flex items-center gap-2 border-b border-slate-800/80 bg-slate-950/50 px-4 py-3 backdrop-blur-md md:hidden">
				<Sheet open={open} onOpenChange={setOpen}>
					<SheetTrigger asChild>
						<Button variant="outline" size="icon" className="border-slate-800">
							<Menu className="h-5 w-5" />
							<span className="sr-only">Abrir menú</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="w-72 p-0">
						<div className="flex h-full flex-col">
							<div className="border-b border-slate-800/80 px-4 py-4">
								<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E11D48]">
									Centro de control
								</p>
								<div className="mt-3">
									<AppLogo size="md" href="/dashboard" priority />
								</div>
							</div>
							<ScrollArea className="flex-1">
								<NavLinks onNavigate={() => setOpen(false)} />
							</ScrollArea>
						</div>
					</SheetContent>
				</Sheet>
				<AppLogo size="sm" href="/dashboard" priority />
			</div>

			<aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 flex-col border-r border-slate-800/80 bg-slate-950/50 backdrop-blur-md md:flex">
				<div className="border-b border-slate-800/80 px-4 py-6">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E11D48]">
						Operaciones
					</p>
					<div className="mt-3">
						<AppLogo size="lg" href="/dashboard" priority />
					</div>
					<p className="mt-2 text-xs text-slate-500">
						Membresías e ingresos en un solo lugar
					</p>
				</div>
				<ScrollArea className="flex-1">
					<NavLinks />
				</ScrollArea>
				<div className="flex items-center gap-2 border-t border-slate-800/80 p-4 text-xs text-slate-500">
					<AppLogo size="sm" className="max-w-[100px] opacity-80" />
					<span>· MVP</span>
				</div>
			</aside>
		</>
	);
}
