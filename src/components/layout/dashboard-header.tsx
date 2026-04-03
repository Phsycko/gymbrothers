"use client";

import { Bell, Command, Search } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { User as LuciaUser } from "@/lib/auth/auth";

import { UserMenu } from "@/components/layout/user-menu";

export interface DashboardHeaderProps {
	user: LuciaUser;
}

export function DashboardHeader({
	user,
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
		<header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-800/80 bg-slate-950/70 px-4 backdrop-blur-md md:px-6">
			<div className="relative flex flex-1 items-center">
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
			<TooltipProvider delayDuration={200}>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className="relative border-slate-800 bg-slate-900/40"
							aria-label="Notificaciones"
						>
							<Bell className="h-4 w-4 text-slate-300" />
							<span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#E11D48] ring-2 ring-slate-950" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>Sin alertas nuevas</TooltipContent>
				</Tooltip>
			</TooltipProvider>
			<UserMenu user={user} />
		</header>
	);
}
