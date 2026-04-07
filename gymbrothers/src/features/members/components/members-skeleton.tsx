import { Skeleton } from "@/components/ui/skeleton";

export function MembersSkeleton(): React.ReactElement {
	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-2">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-4 w-80 max-w-full" />
				</div>
				<Skeleton className="h-11 w-40 rounded-lg" />
			</div>
			<Skeleton className="h-11 max-w-md rounded-md" />
			<div className="overflow-hidden rounded-lg border border-slate-800/60 bg-slate-950/40">
				<div className="grid grid-cols-[minmax(140px,1.4fr)_0.85fr_0.65fr_minmax(100px,0.9fr)_120px] gap-2 border-b border-slate-800/60 px-4 py-3">
					{["Socio", "Teléfono", "Estado", "Vencimiento", "QR"].map((label) => (
						<Skeleton key={label} className="h-4 w-16" />
					))}
				</div>
				{[0, 1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className="grid grid-cols-[minmax(140px,1.4fr)_0.85fr_0.65fr_minmax(100px,0.9fr)_120px] items-center gap-2 border-b border-slate-800/40 px-4 py-4"
					>
						<div className="space-y-2">
							<Skeleton className="h-4 w-36" />
							<Skeleton className="h-3 w-44" />
						</div>
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-6 w-16 rounded-full" />
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-9 w-[118px] rounded-md" />
					</div>
				))}
			</div>
		</div>
	);
}
