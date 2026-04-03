import { Skeleton } from "@/components/ui/skeleton";

/** Vista previa inmediata al cambiar de ruta dentro del panel. */
export default function DashboardLoading(): React.ReactElement {
	return (
		<div className="space-y-8">
			<div className="space-y-2">
				<Skeleton className="h-9 w-64" />
				<Skeleton className="h-4 w-96 max-w-full" />
			</div>
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{["a", "b", "c", "d"].map((k) => (
					<Skeleton
						key={k}
						className="h-32 rounded-xl border border-slate-800/60"
					/>
				))}
			</div>
			<Skeleton className="h-[380px] rounded-xl border border-slate-800/60" />
			<Skeleton className="h-72 rounded-xl border border-slate-800/60" />
		</div>
	);
}
