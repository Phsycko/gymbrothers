import { Loader2 } from "lucide-react";

export default function EquipmentReportsLoading(): React.ReactElement {
	return (
		<div className="flex min-h-[40vh] items-center justify-center text-slate-500">
			<Loader2 className="h-8 w-8 animate-spin" aria-hidden />
			<span className="sr-only">Cargando averías…</span>
		</div>
	);
}
