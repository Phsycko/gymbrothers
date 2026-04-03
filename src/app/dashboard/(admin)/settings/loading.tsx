import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading(): React.ReactElement {
	return (
		<div className="mx-auto max-w-lg space-y-4">
			<Skeleton className="h-40 w-full rounded-xl border border-slate-800/60" />
		</div>
	);
}
