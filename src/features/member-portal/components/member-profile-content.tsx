import Link from "next/link";
import { Shield } from "lucide-react";

import { getMemberPortalData } from "@/features/member-portal/lib/get-member-portal-data";
import { getSubscriptionUiStatus } from "@/features/member-portal/lib/subscription-status";
import { cn } from "@/lib/utils";

function formatMxDate(d: Date): string {
	return new Intl.DateTimeFormat("es-MX", {
		dateStyle: "medium",
	}).format(d);
}

function formatMoneyCents(cents: number): string {
	return new Intl.NumberFormat("es-MX", {
		style: "currency",
		currency: "MXN",
	}).format(cents / 100);
}

export async function MemberProfileContent({
	userId,
	userEmail,
	username,
	passwordIsDefault,
}: {
	userId: string;
	userEmail: string;
	username: string;
	passwordIsDefault: boolean;
}): Promise<React.ReactElement> {
	const portal = await getMemberPortalData(userId, userEmail);
	const status = getSubscriptionUiStatus(portal.subscription);
	const member = portal.member;

	if (!member) {
		return (
			<div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100 backdrop-blur-xl">
				Sin ficha de socio vinculada a este correo. Contacta recepción.
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<h1 className="text-xl font-bold tracking-tight text-white">Tu perfil</h1>

			<Link
				href="/dashboard/member/security"
				className={cn(
					"flex items-center gap-4 rounded-2xl border p-5 transition-colors backdrop-blur-xl",
					passwordIsDefault
						? "border-amber-500/45 bg-amber-500/10 hover:border-amber-400/60"
						: "border-white/10 bg-white/5 hover:border-[#E11D48]/35",
				)}
			>
				<div
					className={cn(
						"flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border",
						passwordIsDefault
							? "border-amber-500/40 bg-amber-500/15 text-amber-200"
							: "border-white/15 bg-black/40 text-[#E11D48]",
					)}
				>
					<Shield className="h-6 w-6" aria-hidden />
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-sm font-semibold text-white">Seguridad</p>
					<p className="text-xs text-white/55">
						{passwordIsDefault
							? "Cambia tu contraseña genérica ahora."
							: "Cambiar contraseña de acceso al portal."}
					</p>
				</div>
			</Link>

			<div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
				<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
					Datos personales
				</h2>
				<dl className="mt-4 space-y-3 text-sm">
					<div>
						<dt className="text-white/45">Usuario</dt>
						<dd className="font-mono font-medium text-white">{username}</dd>
					</div>
					<div>
						<dt className="text-white/45">Nombre</dt>
						<dd className="font-medium text-white">{member.fullName}</dd>
					</div>
					<div>
						<dt className="text-white/45">Correo</dt>
						<dd className="font-medium text-white">{member.email}</dd>
					</div>
					{member.phone ? (
						<div>
							<dt className="text-white/45">Teléfono</dt>
							<dd className="font-medium text-white">{member.phone}</dd>
						</div>
					) : null}
				</dl>
			</div>

			<div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
				<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
					Plan y vigencia
				</h2>
				{portal.plan && portal.subscription ? (
					<dl className="mt-4 space-y-3 text-sm">
						<div>
							<dt className="text-white/45">Plan</dt>
							<dd className="font-medium text-white">{portal.plan.name}</dd>
						</div>
						<div>
							<dt className="text-white/45">Precio</dt>
							<dd className="font-medium text-white">
								{formatMoneyCents(portal.plan.priceCents)} ·{" "}
								{portal.plan.durationMonths}{" "}
								{portal.plan.durationMonths === 1 ? "mes" : "meses"}
							</dd>
						</div>
						<div>
							<dt className="text-white/45">Inicio</dt>
							<dd className="font-medium text-white">
								{formatMxDate(portal.subscription.startDate)}
							</dd>
						</div>
						<div>
							<dt className="text-white/45">Vencimiento</dt>
							<dd className="font-medium text-white">
								{formatMxDate(portal.subscription.endDate)}
							</dd>
						</div>
						<div>
							<dt className="text-white/45">Estado</dt>
							<dd
								className={cn(
									"font-semibold",
									status.isActive ? "text-emerald-400" : "text-red-400",
								)}
							>
								{status.isActive ? "Activo" : "Vencido"}
							</dd>
						</div>
					</dl>
				) : (
					<p className="mt-3 text-sm text-white/55">
						No hay un plan activo registrado. Contacta recepción para más información.
					</p>
				)}
			</div>
		</div>
	);
}
