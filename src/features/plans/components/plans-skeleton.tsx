import { Skeleton } from "@/components/ui/skeleton";

export function PlansSkeleton(): React.ReactElement {
	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-2">
					<Skeleton className="h-9 w-64" />
					<Skeleton className="h-4 w-full max-w-xl" />
				</div>
				<Skeleton className="h-11 w-44 rounded-lg" />
			</div>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
				{[0, 1, 2].map((i) => (
					<div
						key={i}
						className="flex flex-col rounded-lg border border-red-900/20 bg-slate-950/50 p-6"
					>
						<Skeleton className="h-6 w-[75%]" />
						<Skeleton className="mt-3 h-16 w-full" />
						<Skeleton className="mt-6 h-10 w-32" />
						<Skeleton className="mt-2 h-8 w-24" />
						<div className="mt-6 flex justify-between border-t border-slate-800/80 pt-4">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-6 w-11 rounded-full" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
