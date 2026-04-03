import { Skeleton } from "@/components/ui/skeleton";

export default function AnnouncementsLoading(): React.ReactElement {
	return (
		<div className="space-y-10">
			<div className="space-y-2">
				<Skeleton className="h-9 w-64" />
				<Skeleton className="h-4 w-full max-w-xl" />
			</div>
			<div className="grid gap-8 lg:grid-cols-2">
				<Skeleton className="min-h-[420px] rounded-xl border border-slate-800/60" />
				<Skeleton className="min-h-[280px] rounded-xl border border-slate-800/60" />
			</div>
			<Skeleton className="h-40 rounded-xl border border-slate-800/60" />
		</div>
	);
}
