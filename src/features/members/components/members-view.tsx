"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";

import type { MemberListRow } from "@/features/members/lib/get-members";

import { AddMemberDialog } from "./add-member-dialog";
import { MemberTable } from "./member-table";

export interface MembersViewProps {
	initialMembers: MemberListRow[];
}

function normalize(s: string): string {
	return s.trim().toLowerCase();
}

export function MembersView({
	initialMembers,
}: MembersViewProps): React.ReactElement {
	const [query, setQuery] = useState("");

	const filtered = useMemo(() => {
		const q = normalize(query);
		if (!q) {
			return initialMembers;
		}
		return initialMembers.filter((m) => {
			const name = normalize(m.fullName);
			const email = normalize(m.email);
			return name.includes(q) || email.includes(q);
		});
	}, [initialMembers, query]);

	const emptyMessage =
		initialMembers.length === 0
			? "Aún no hay socios. Añade el primero con el botón de arriba."
			: "Ningún socio coincide con tu búsqueda.";

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-slate-50 md:text-3xl">
						Socios
					</h1>
					<p className="mt-1 text-sm text-slate-500">
						Listado administrativo — busca por nombre o correo.
					</p>
				</div>
				<AddMemberDialog />
			</div>

			<div className="relative max-w-md">
				<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
				<Input
					type="search"
					placeholder="Buscar nombre o correo…"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="h-11 border-slate-800 bg-slate-950/80 pl-10 text-slate-100 placeholder:text-slate-600 focus-visible:ring-[#E11D48]"
					aria-label="Filtrar socios"
				/>
			</div>

			<MemberTable members={filtered} emptyMessage={emptyMessage} />
		</div>
	);
}
