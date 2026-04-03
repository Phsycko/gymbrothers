import { AdminTrainingClient } from "@/features/training/components/admin-training-client";
import {
	getAllExercises,
	getMembersForRoutineAssignment,
	getRoutinesWithExerciseIds,
} from "@/features/training/lib/get-training-data";

export default async function AdminTrainingPage(): Promise<React.ReactElement> {
	const [exercises, routines, assignmentMembers] = await Promise.all([
		getAllExercises(),
		getRoutinesWithExerciseIds(),
		getMembersForRoutineAssignment(),
	]);

	return (
		<AdminTrainingClient
			exercises={exercises}
			routines={routines}
			assignmentMembers={assignmentMembers}
		/>
	);
}
