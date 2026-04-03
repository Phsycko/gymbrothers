import { redirect } from "next/navigation";

import { isMemberRole } from "@/lib/auth/roles";
import { validateRequest } from "@/lib/auth/validate-request";

export default async function AdminDashboardGroupLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>): Promise<React.ReactElement> {
	const { user } = await validateRequest();
	if (!user) {
		redirect("/login");
	}
	if (isMemberRole(user.role)) {
		redirect("/dashboard/member");
	}
	return <>{children}</>;
}
