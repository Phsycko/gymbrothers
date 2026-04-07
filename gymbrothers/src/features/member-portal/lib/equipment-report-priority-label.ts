export type ReportPriority = "low" | "medium" | "high";

export function reportPriorityLabelEs(p: ReportPriority): string {
	switch (p) {
		case "low":
			return "Baja";
		case "medium":
			return "Media";
		case "high":
			return "Alta";
		default:
			return p;
	}
}

export function reportPriorityBadgeClass(p: ReportPriority): string {
	switch (p) {
		case "high":
			return "border-rose-500/45 bg-rose-500/15 text-rose-200";
		case "medium":
			return "border-amber-500/40 bg-amber-500/12 text-amber-200";
		case "low":
			return "border-white/20 bg-white/5 text-white/65";
		default:
			return "border-white/15 bg-white/5 text-white/60";
	}
}
