import { DashboardOverview } from "@/features/dashboard/dashboard-overview";
import { getDashboardOverview } from "@/features/dashboard/lib/get-dashboard-overview";

export default async function DashboardPage(): Promise<React.ReactElement> {
	const data = await getDashboardOverview();
	return <DashboardOverview data={data} />;
}
