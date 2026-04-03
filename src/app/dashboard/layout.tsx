import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { MemberDashboardShell } from "@/components/layout/member-dashboard-shell";
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
	return <DashboardShell user={user}>{children}</DashboardShell>;
}
