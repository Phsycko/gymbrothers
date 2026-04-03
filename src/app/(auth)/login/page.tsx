import { redirect } from "next/navigation";

import { LoginForm } from "@/features/auth/components/login-form";
import { validateRequest } from "@/lib/auth/validate-request";

export default async function LoginPage(): Promise<React.ReactElement> {
	const { user } = await validateRequest();
	if (user) {
		redirect(user.role === "member" ? "/dashboard/member" : "/dashboard");
	}
	return <LoginForm />;
}
