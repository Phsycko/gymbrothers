import { redirect } from "next/navigation";

import { MemberMotionLayout } from "@/features/member-portal/components/member-motion-layout";
import { validateRequest } from "@/lib/auth/validate-request";

export default async function MemberPortalLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>): Promise<React.ReactElement> {
	const { user } = await validateRequest();
	if (!user) {
		redirect("/login");
	}
	if (user.role !== "member") {
		redirect("/dashboard");
	}
	return <MemberMotionLayout>{children}</MemberMotionLayout>;
}
