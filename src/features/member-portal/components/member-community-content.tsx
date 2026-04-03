import { getAnnouncements } from "@/features/announcements/lib/get-announcements";

export async function MemberCommunityContent(): Promise<React.ReactElement> {
	const { announcements, missingTable } = await getAnnouncements();

	if (missingTable) {
		return (
			<div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60 backdrop-blur-xl">
				El tablón de anuncios aún no está disponible. Vuelve más tarde o contacta al
				staff.
			</div>
		);
	}

	if (announcements.length === 0) {
		return (
			<div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/55 backdrop-blur-xl">
				No hay anuncios publicados.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h1 className="text-xl font-bold tracking-tight text-white">Comunidad</h1>
			<p className="text-sm text-white/55">
				Novedades y avisos del gym para todos los brothers.
			</p>
			<ul className="space-y-4">
				{announcements.map((a) => (
					<li
						key={a.id}
						className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
					>
						<div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">
							<span>{a.category}</span>
							<span className="text-white/25">·</span>
							<span>{a.priority}</span>
						</div>
						<h2 className="text-lg font-semibold text-white">{a.title}</h2>
						<p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/70">
							{a.content}
						</p>
					</li>
				))}
			</ul>
		</div>
	);
}
