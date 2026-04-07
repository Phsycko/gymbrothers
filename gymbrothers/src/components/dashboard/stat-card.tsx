"use client";

import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
	title: string;
	value: string;
	subtitle?: string;
	icon: LucideIcon;
	iconClassName?: string;
	trend?: {
		value: string;
		positive: boolean;
	};
	className?: string;
}

export function StatCard({
	title,
	value,
	subtitle,
	icon: Icon,
	iconClassName,
	trend,
	className,
}: StatCardProps): React.ReactElement {
	return (
		<div>
			<Card
				className={cn(
					"overflow-hidden border-slate-800/80 bg-slate-950/50 shadow-lg backdrop-blur-md transition-shadow hover:border-[#E11D48]/22 hover:shadow-[0_0_24px_rgba(225,29,72,0.06)]",
					className,
				)}
			>
				<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium text-slate-400">
						{title}
					</CardTitle>
					<div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2">
						<Icon className={cn("h-4 w-4 text-[#E11D48]/90", iconClassName)} />
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold tracking-tight text-slate-50">
						{value}
					</div>
					{trend ? (
						<p
							className={cn(
								"mt-1 text-xs font-medium",
								trend.positive ? "text-red-400" : "text-rose-400",
							)}
						>
							{trend.value}
						</p>
					) : null}
					{subtitle ? (
						<p className="mt-1 text-xs text-slate-500">{subtitle}</p>
					) : null}
				</CardContent>
			</Card>
		</div>
	);
}
