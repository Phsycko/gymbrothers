import { Skeleton } from "@/components/ui/skeleton";

export function PaymentsSkeleton(): React.ReactElement {
	return (
		<div className="space-y-10">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-2">
					<Skeleton className="h-9 w-48" />
					<Skeleton className="h-4 w-full max-w-xl" />
				</div>
				<Skeleton className="h-11 w-44 rounded-lg" />
			</div>
			<div className="space-y-3">
				<Skeleton className="h-4 w-24" />
				<div className="overflow-hidden rounded-lg border border-red-600/30 bg-slate-950">
					{[0, 1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="flex gap-4 border-b border-slate-800/60 px-4 py-4 last:border-0"
						>
							<Skeleton className="h-4 flex-1" />
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-6 w-20 rounded-full" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
