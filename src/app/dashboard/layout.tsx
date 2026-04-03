import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { MemberDashboardShell } from "@/components/layout/member-dashboard-shell";
import { getAdminNotificationAlerts } from "@/features/dashboard/lib/get-admin-notification-alerts";
import { isMemberRole } from "@/lib/auth/roles";
import { validateRequest } from "@/lib/auth/validate-request";

export default async function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>): Promise<React.ReactElement> {
	const { user } = await validateRequest();
	if (!user) {
		redirect("/login");
	}
	if (isMemberRole(user.role)) {
		return (
			<MemberDashboardShell user={user}>{children}</MemberDashboardShell>
		);
	}
	const notificationAlerts = await getAdminNotificationAlerts();
	return (
		<DashboardShell user={user} notificationAlerts={notificationAlerts}>
			{children}
		</DashboardShell>
	);
}
