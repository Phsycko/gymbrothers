import { AdminTrainingClient } from "@/features/training/components/admin-training-client";
import {
	getAllExercises,
	getRoutinesWithExerciseIds,
} from "@/features/training/lib/get-training-data";

export default async function AdminTrainingPage(): Promise<React.ReactElement> {
	const [exercises, routines] = await Promise.all([
		getAllExercises(),
		getRoutinesWithExerciseIds(),
	]);

	return (
		<AdminTrainingClient exercises={exercises} routines={routines} />
	);
}
