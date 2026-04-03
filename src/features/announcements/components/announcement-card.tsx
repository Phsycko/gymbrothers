"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { CalendarDays, Megaphone, Trash, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Announcement } from "@/server/db/schema/gym-schema";

export interface AnnouncementCardProps {
	id?: string;
	title: string;
	content: string;
	priority: Announcement["priority"];
	category: Announcement["category"];
	createdAt?: Date;
	/** List entrance animation (feed). */
	withEntranceMotion?: boolean;
	onDelete?: (id: string) => void;
	deletePending?: boolean;
	className?: string;
}

const categorySurface: Record<Announcement["category"], string> = {
	event:
		"border-slate-700/80 bg-slate-950/60 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.12)]",
	maintenance:
		"border-amber-500/35 bg-amber-950/25 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.15)]",
	promotion:
		"border-emerald-500/35 bg-emerald-950/25 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.12)]",
};

const priorityLabel: Record<Announcement["priority"], string> = {
	low: "Baja",
	medium: "Media",
	high: "Alta",
};

const categoryLabel: Record<Announcement["category"], string> = {
	event: "Evento",
	maintenance: "Mantenimiento",
	promotion: "Promoción",
};

const highPulse = [
	"0 0 0 0 rgba(225, 29, 72, 0)",
	"0 0 24px 3px rgba(225, 29, 72, 0.5)",
	"0 0 0 0 rgba(225, 29, 72, 0)",
];

export function AnnouncementCard({
	id,
	title,
	content,
	priority,
	category,
	createdAt,
	withEntranceMotion = false,
	onDelete,
	deletePending,
	className,
}: AnnouncementCardProps): React.ReactElement {
	const isCritical = priority === "high";
	const CategoryIcon =
		category === "maintenance"
			? Wrench
			: category === "promotion"
				? Megaphone
				: CalendarDays;

	const inner = (
		<Card
			className={cn(
				"overflow-hidden border backdrop-blur-sm transition-colors",
				categorySurface[category],
				isCritical && "ring-1 ring-[#E11D48]/45",
				className,
			)}
		>
			<CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0 pb-2">
				<div className="flex min-w-0 flex-1 items-start gap-2">
					<div
						className={cn(
							"mt-0.5 rounded-md border p-1.5",
							category === "maintenance" &&
								"border-amber-500/30 bg-amber-950/40 text-amber-400",
							category === "promotion" &&
								"border-emerald-500/30 bg-emerald-950/40 text-emerald-400",
							category === "event" &&
								"border-slate-600 bg-slate-900/80 text-slate-300",
						)}
					>
						<CategoryIcon className="h-4 w-4" aria-hidden />
					</div>
					<div className="min-w-0 flex-1">
						<CardTitle className="text-base font-bold leading-snug text-white">
							{title}
						</CardTitle>
						<div className="mt-2 flex flex-wrap items-center gap-2">
							<Badge
								variant="outline"
								className={cn(
									"border-slate-600 text-[10px] uppercase tracking-wider text-slate-400",
								)}
							>
								{categoryLabel[category]}
							</Badge>
							{isCritical ? (
								<Badge
									variant="outline"
									className="border-[#E11D48]/50 bg-[#E11D48]/15 text-[10px] font-bold uppercase tracking-wider text-red-300"
								>
									Crítico
								</Badge>
							) : (
								<Badge variant="outline" className="text-[10px] text-slate-500">
									Prioridad: {priorityLabel[priority]}
								</Badge>
							)}
							{createdAt ? (
								<span className="text-[11px] text-slate-500">
									{format(createdAt, "d MMM yyyy · HH:mm", { locale: es })}
								</span>
							) : null}
						</div>
					</div>
				</div>
				{id && onDelete ? (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="shrink-0 text-slate-500 hover:bg-red-950/40 hover:text-red-400"
						disabled={deletePending}
						onClick={() => onDelete(id)}
						aria-label="Eliminar anuncio"
					>
						<Trash className="h-4 w-4" />
					</Button>
				) : null}
			</CardHeader>
			<CardContent className="pt-0">
				<p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
					{content}
				</p>
			</CardContent>
		</Card>
	);

	const wrapped = isCritical ? (
		<motion.div
			className="rounded-xl"
			initial={false}
			animate={{ boxShadow: highPulse }}
			transition={{
				duration: 2.2,
				repeat: Number.POSITIVE_INFINITY,
				ease: "easeInOut",
			}}
		>
			{inner}
		</motion.div>
	) : (
		inner
	);

	if (!withEntranceMotion) {
		return wrapped;
	}

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 14 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
		>
			{wrapped}
		</motion.div>
	);
}
