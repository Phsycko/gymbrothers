import { ExerciseRequestsAdminView } from "@/features/member-portal/components/exercise-requests-admin-view";
import { getExerciseRequestsForAdmin } from "@/features/member-portal/lib/get-exercise-requests";

export default async function ExerciseRequestsAdminPage(): Promise<React.ReactElement> {
	const { requests, missingTable } = await getExerciseRequestsForAdmin();
	return (
		<ExerciseRequestsAdminView
			initialRequests={requests}
			missingTable={missingTable}
		/>
	);
}
