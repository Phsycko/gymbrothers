import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

import { getAnnouncements } from "@/features/announcements/lib/get-announcements";
import { getMemberPortalData } from "@/features/member-portal/lib/get-member-portal-data";
import { getSubscriptionUiStatus } from "@/features/member-portal/lib/subscription-status";
import { cn } from "@/lib/utils";

function initialsFromName(name: string): string {
	const p = name.trim().split(/\s+/).filter(Boolean);
	if (p.length === 0) {
		return "?";
	}
	if (p.length === 1) {
		const w = p[0] ?? "";
		return w.slice(0, 2).toUpperCase();
	}
	const first = p[0]?.[0] ?? "";
	const last = p[p.length - 1]?.[0] ?? "";
	return `${first}${last}`.toUpperCase();
}

export async function MemberHomeContent({
	userId,
	userEmail,
	passwordIsDefault,
}: {
	userId: string;
	userEmail: string;
	passwordIsDefault: boolean;
}): Promise<React.ReactElement> {
	const portal = await getMemberPortalData(userId, userEmail);
	const { announcements, missingTable } = await getAnnouncements();
	const preview = announcements.slice(0, 5);

	const status = getSubscriptionUiStatus(portal.subscription);
	const member = portal.member;
	const displayName =
		member?.fullName ??
		userEmail.split("@")[0]?.replace(/\./g, " ") ??
		"Brother";

	if (!member) {
		return (
			<div className="space-y-6">
				<section className="flex items-center gap-4">
					<div
						className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-xl font-bold text-white"
						aria-hidden
					>
						?
					</div>
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
							Bienvenido de nuevo
						</p>
						<h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
							{displayName}
						</h1>
					</div>
				</section>
				<div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100 backdrop-blur-xl">
					No encontramos una ficha de socio asociada a tu correo. Si ya eres
					miembro, pide en recepción que vinculen tu email o contacta al staff.
				</div>
			</div>
		);
	}

	const qrValue = member.qrIdentifier;

	return (
		<div className="space-y-8">
			{passwordIsDefault ? (
				<div
					className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-100 backdrop-blur-xl"
					role="status"
				>
					Tu contraseña actual es la genérica. Por seguridad, cámbiala ahora.{" "}
					<Link
						href="/dashboard/member/security"
						className="font-semibold text-[#E11D48] underline underline-offset-2 hover:text-red-400"
					>
						Ir a seguridad
					</Link>
				</div>
			) : null}

			<section className="flex items-center gap-4">
				<div
					className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-[#E11D48] bg-[#E11D48]/20 text-xl font-bold text-white shadow-[0_0_24px_rgba(225,29,72,0.35)]"
					aria-hidden
				>
					{initialsFromName(member.fullName)}
				</div>
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
						Bienvenido de nuevo
					</p>
					<h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
						{displayName}
					</h1>
				</div>
			</section>

			<section aria-labelledby="entry-qr-heading">
				<h2
					id="entry-qr-heading"
					className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#E11D48]"
				>
					Acceso al gym
				</h2>
				<div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-inner backdrop-blur-xl">
					<div className="flex flex-col items-center gap-4">
						<div className="rounded-xl bg-white p-4 shadow-lg">
							<QRCodeSVG
								value={qrValue}
								size={200}
								level="M"
								includeMargin={false}
								className="h-auto w-[min(72vw,220px)] max-w-full"
							/>
						</div>
						<p className="text-center text-xs text-white/55">
							Muestra este código en entrada. Es único para tu membresía.
						</p>
					</div>
				</div>
			</section>

			<section aria-labelledby="status-heading">
				<h2
					id="status-heading"
					className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/50"
				>
					Tu membresía
				</h2>
				<div
					className={cn(
						"rounded-2xl border p-5 backdrop-blur-xl",
						status.isActive
							? "border-emerald-500/35 bg-emerald-500/10"
							: "border-red-500/35 bg-red-500/10",
					)}
				>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<p
								className={cn(
									"text-lg font-bold",
									status.isActive ? "text-emerald-300" : "text-red-300",
								)}
							>
								{status.isActive ? "Activa" : "Vencida"}
							</p>
							{portal.plan ? (
								<p className="text-sm text-white/70">{portal.plan.name}</p>
							) : (
								<p className="text-sm text-white/50">Sin plan asignado</p>
							)}
						</div>
						<div className="text-right">
							{status.isActive ? (
								<>
									<p className="text-3xl font-black tabular-nums text-white">
										{status.daysRemaining}
									</p>
									<p className="text-xs text-white/55">
										{status.daysRemaining === 1
											? "día restante"
											: "días restantes"}
									</p>
								</>
							) : (
								<p className="max-w-[12rem] text-sm text-red-200/90">
									Renueva en recepción o por los canales oficiales.
								</p>
							)}
						</div>
					</div>
				</div>
			</section>

			<section aria-labelledby="announcements-heading">
				<div className="mb-3 flex items-center justify-between gap-2">
					<h2
						id="announcements-heading"
						className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50"
					>
						Anuncios
					</h2>
					<Link
						href="/dashboard/member/community"
						className="text-xs font-semibold text-[#E11D48] hover:underline"
					>
						Ver todos
					</Link>
				</div>
				{missingTable ? (
					<p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/55 backdrop-blur-xl">
						Los anuncios estarán disponibles cuando el staff active el tablón.
					</p>
				) : preview.length === 0 ? (
					<p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/55 backdrop-blur-xl">
						No hay anuncios por ahora.
					</p>
				) : (
					<ul className="space-y-3">
						{preview.map((a) => (
							<li
								key={a.id}
								className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
							>
								<p className="font-semibold text-white">{a.title}</p>
								<p className="mt-1 line-clamp-2 text-sm text-white/60">
									{a.content}
								</p>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}
