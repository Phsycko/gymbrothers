import { getAnnouncements } from "@/features/announcements/lib/get-announcements";
import { ExerciseRequestBoard } from "@/features/member-portal/components/exercise-request-board";
import { getExerciseRequestsForCommunity } from "@/features/member-portal/lib/get-exercise-requests";
import { validateRequest } from "@/lib/auth/validate-request";

export async function MemberCommunityContent(): Promise<React.ReactElement> {
	const { user } = await validateRequest();
	const userId = user?.id ?? "";

	const [{ announcements, missingTable: missingAnnouncements }, exerciseReq] =
		await Promise.all([getAnnouncements(), getExerciseRequestsForCommunity()]);

	return (
		<div className="space-y-10">
			<div>
				<h1 className="text-xl font-bold tracking-tight text-white">
					Comunidad
				</h1>
				<p className="mt-1 text-sm text-white/55">
					Pide ejercicios para la biblioteca y entérate de las novedades del
					gym.
				</p>
			</div>

			<ExerciseRequestBoard
				initialRequests={exerciseReq.requests}
				currentUserId={userId}
				missingTable={exerciseReq.missingTable}
			/>

			<section
				aria-labelledby="gym-announcements-heading"
				className="space-y-4"
			>
				<h2
					id="gym-announcements-heading"
					className="text-sm font-bold uppercase tracking-[0.2em] text-white/45"
				>
					Anuncios del gym
				</h2>

				{missingAnnouncements ? (
					<div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60 backdrop-blur-xl">
						El tablón de anuncios aún no está disponible. Vuelve más tarde o
						contacta al staff.
					</div>
				) : announcements.length === 0 ? (
					<div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/55 backdrop-blur-xl">
						No hay anuncios publicados.
					</div>
				) : (
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
								<h3 className="text-lg font-semibold text-white">{a.title}</h3>
								<p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/70">
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
