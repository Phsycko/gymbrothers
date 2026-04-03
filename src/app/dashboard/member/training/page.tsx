import { redirect } from "next/navigation";

import { validateRequest } from "@/lib/auth/validate-request";

import { MemberRoutinesSection } from "@/features/training/components/member-routines-section";
import { MemberTrainingView } from "@/features/training/components/member-training-view";
import {
	getAllExercises,
	getRoutinesForMember,
} from "@/features/training/lib/get-training-data";

export default async function MemberTrainingPage(): Promise<React.ReactElement> {
	const { user } = await validateRequest();
	if (!user) {
		redirect("/login");
	}
	if (user.role !== "member") {
		redirect("/dashboard");
	}

	const [exercises, routines] = await Promise.all([
		getAllExercises(),
		getRoutinesForMember(user.id),
	]);

	const exercisesById = new Map(exercises.map((e) => [e.id, e]));

	return (
		<div className="min-w-0 space-y-12 overflow-x-hidden">
			<MemberTrainingView exercises={exercises} />
			<MemberRoutinesSection
				routines={routines}
				exercisesById={exercisesById}
			/>
		</div>
	);
}
