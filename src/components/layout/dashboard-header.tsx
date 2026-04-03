"use client";

import { Bell, Command, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { AppLogo } from "@/components/branding/app-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AdminNotificationAlerts } from "@/features/dashboard/lib/get-admin-notification-alerts";
import type { User as LuciaUser } from "@/lib/auth/auth";
import { cn } from "@/lib/utils";

import { UserMenu } from "@/components/layout/user-menu";

export interface DashboardHeaderProps {
	user: LuciaUser;
	notificationAlerts: AdminNotificationAlerts;
}

function notificationKindStyles(
	kind: AdminNotificationAlerts["items"][number]["kind"],
): string {
	switch (kind) {
		case "expiring_soon":
			return "border-amber-500/25 bg-amber-500/5";
		case "past_due":
			return "border-orange-500/25 bg-orange-500/5";
		default:
			return "border-[#E11D48]/25 bg-red-500/5";
	}
}

export function DashboardHeader({
	user,
	notificationAlerts,
}: DashboardHeaderProps): React.ReactElement {
	const searchRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		function onKey(e: KeyboardEvent): void {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				searchRef.current?.focus();
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	return (
		<header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-800/80 bg-slate-950/70 px-4 backdrop-blur-md md:gap-4 md:px-6">
			<Link
				href="/dashboard"
				className="shrink-0 rounded-lg outline-none ring-offset-2 ring-offset-slate-950 focus-visible:ring-2 focus-visible:ring-[#E11D48]/60"
				aria-label="Inicio — GYM BROTHERS"
			>
				<AppLogo size="sm" className="md:h-9" />
			</Link>
			<div className="relative flex min-w-0 flex-1 items-center">
				<Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-500" />
				<Input
					ref={searchRef}
					type="search"
					placeholder="Buscar socios, planes, pagos…"
					className="h-10 border-slate-800 bg-slate-900/50 pl-10 pr-24 text-slate-100 placeholder:text-slate-500"
					aria-label="Búsqueda global"
				/>
				<kbd className="pointer-events-none absolute right-3 hidden h-6 select-none items-center gap-1 rounded border border-slate-700 bg-slate-800/80 px-1.5 font-mono text-[10px] font-medium text-slate-400 sm:flex">
					<Command className="h-3 w-3" />K
				</kbd>
			</div>
			<Popover>
				<TooltipProvider delayDuration={200}>
					<Tooltip>
						<TooltipTrigger asChild>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									className="relative shrink-0 border-slate-800 bg-slate-900/40"
									aria-label={
										notificationAlerts.totalCount > 0
											? `Alertas de socios (${notificationAlerts.totalCount})`
											: "Alertas de socios"
									}
								>
									<Bell className="h-4 w-4 text-slate-300" />
									{notificationAlerts.totalCount > 0 ? (
										<span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E11D48] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-slate-950">
											{notificationAlerts.totalCount > 99
												? "99+"
												: notificationAlerts.totalCount}
										</span>
									) : null}
								</Button>
							</PopoverTrigger>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							{notificationAlerts.totalCount > 0
								? `${notificationAlerts.totalCount} alerta${notificationAlerts.totalCount === 1 ? "" : "s"} de socios`
								: "Sin alertas de socios"}
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<PopoverContent
					align="end"
					className="w-[min(100vw-2rem,22rem)] border-slate-800 bg-slate-950 p-0"
					sideOffset={8}
				>
					<div className="border-b border-slate-800 px-3 py-2.5">
						<p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
							Alertas
						</p>
						<p className="mt-0.5 text-sm text-slate-300">
							Membresías y cobros
						</p>
					</div>
					{notificationAlerts.items.length === 0 ? (
						<div className="px-3 py-8 text-center">
							<p className="text-sm text-slate-500">No hay alertas. Todo al día.</p>
							<Link
								href="/dashboard/members"
								className="mt-3 inline-block text-xs font-medium text-[#E11D48] hover:underline"
							>
								Ver socios
							</Link>
						</div>
					) : (
						<>
							<div className="max-h-[min(70vh,22rem)] overflow-y-auto overscroll-contain">
								<ul className="divide-y divide-slate-800/80 p-1">
									{notificationAlerts.items.map((item) => (
										<li key={item.id}>
											<Link
												href={item.href}
												className={cn(
													"block rounded-md border px-2.5 py-2 transition-colors hover:bg-slate-900/80",
													notificationKindStyles(item.kind),
												)}
											>
												<p className="font-medium text-slate-100">
													{item.title}
												</p>
												<p className="mt-0.5 text-xs leading-snug text-slate-400">
													{item.subtitle}
												</p>
											</Link>
										</li>
									))}
								</ul>
							</div>
							{notificationAlerts.totalCount > notificationAlerts.items.length ? (
								<p className="border-t border-slate-800 px-3 py-2 text-center text-xs text-slate-500">
									+{notificationAlerts.totalCount - notificationAlerts.items.length}{" "}
									más — revisa en{" "}
									<Link
										href="/dashboard/members"
										className="font-medium text-[#E11D48] hover:underline"
									>
										Socios
									</Link>
								</p>
							) : (
								<div className="border-t border-slate-800 px-3 py-2">
									<Link
										href="/dashboard/members"
										className="text-xs font-medium text-[#E11D48] hover:underline"
									>
										Ir a Socios
									</Link>
								</div>
							)}
						</>
					)}
				</PopoverContent>
			</Popover>
			<UserMenu user={user} />
		</header>
	);
}
