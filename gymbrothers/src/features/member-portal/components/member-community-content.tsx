import { Bell } from "lucide-react";

import { getAnnouncements } from "@/features/announcements/lib/get-announcements";
import { CommunityPushBanner } from "@/features/member-portal/components/community-push-banner";
import { EquipmentDamageBoard } from "@/features/member-portal/components/equipment-damage-board";
import { ExerciseRequestBoard } from "@/features/member-portal/components/exercise-request-board";
import {
	reportPriorityBadgeClass,
	reportPriorityLabelEs,
} from "@/features/member-portal/lib/equipment-report-priority-label";
import { getEquipmentDamageReportsForCommunity } from "@/features/member-portal/lib/get-equipment-damage-reports";
import { getExerciseRequestsForCommunity } from "@/features/member-portal/lib/get-exercise-requests";
import { getMemberHasPushSubscription } from "@/features/member-portal/lib/get-member-push-subscription";
import { validateRequest } from "@/lib/auth/validate-request";
import { cn } from "@/lib/utils";

const CATEGORY_ES: Record<string, string> = {
	event: "Evento",
	maintenance: "Mantenimiento",
	promotion: "Promoción",
};

function formatAnnouncementFeedDate(d: Date): string {
	return d.toLocaleString("es", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export async function MemberCommunityContent(): Promise<React.ReactElement> {
	const { user } = await validateRequest();
	const userId = user?.id ?? "";

	const vapidConfigured = Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);

	const [
		{ announcements, missingTable: missingAnnouncements },
		exerciseReq,
		equipmentReports,
		hasPushSubscription,
	] = await Promise.all([
		getAnnouncements(),
		getExerciseRequestsForCommunity(),
		getEquipmentDamageReportsForCommunity(),
		userId ? getMemberHasPushSubscription(userId) : Promise.resolve(false),
	]);

	return (
		<div className="space-y-10">
			<div>
				<h1 className="text-xl font-bold tracking-tight text-white">
					Comunidad
				</h1>
				<p className="mt-1 text-sm text-white/55">
					Avisos del gym, ideas para la biblioteca y reportes de equipamiento en
					un solo lugar.
				</p>
			</div>

			<CommunityPushBanner
				initialSubscribed={hasPushSubscription}
				vapidConfigured={vapidConfigured}
			/>

			<section
				aria-labelledby="gym-announcements-heading"
				className="space-y-4"
			>
				<h2
					id="gym-announcements-heading"
					className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-white/45"
				>
					<Bell className="h-4 w-4 text-[#E11D48]" aria-hidden />
					Avisos del staff
				</h2>
				<p className="text-xs text-white/40">
					Los más recientes primero — horarios, mantenimiento y novedades.
				</p>

				{missingAnnouncements ? (
					<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60 backdrop-blur-xl">
						El tablón de anuncios aún no está disponible. Vuelve más tarde o
						contacta al staff.
					</div>
				) : announcements.length === 0 ? (
					<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-white/55 backdrop-blur-xl">
						No hay anuncios publicados.
					</div>
				) : (
					<ul className="space-y-4">
						{announcements.map((a) => (
							<li
								key={a.id}
								className="rounded-2xl border border-white/[0.08] bg-zinc-950/40 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl"
							>
								<div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
									<div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-white/45">
										<span className="text-white/55">
											{CATEGORY_ES[a.category] ?? a.category}
										</span>
										<span className="text-white/25">·</span>
										<span
											className={cn(
												"rounded-full border px-2 py-0.5",
												reportPriorityBadgeClass(a.priority),
											)}
										>
											{reportPriorityLabelEs(a.priority)}
										</span>
									</div>
									<time
										className="text-[11px] tabular-nums text-white/35"
										dateTime={a.createdAt.toISOString()}
									>
										{formatAnnouncementFeedDate(a.createdAt)}
									</time>
								</div>
								<h3 className="text-lg font-semibold text-white">{a.title}</h3>
								<p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/70">
									{a.content}
								</p>
							</li>
						))}
					</ul>
				)}
			</section>

			<ExerciseRequestBoard
				initialRequests={exerciseReq.requests}
				currentUserId={userId}
				missingTable={exerciseReq.missingTable}
			/>

			<EquipmentDamageBoard
				initialReports={equipmentReports.reports}
				currentUserId={userId}
				missingTable={equipmentReports.missingTable}
			/>
		</div>
	);
}
