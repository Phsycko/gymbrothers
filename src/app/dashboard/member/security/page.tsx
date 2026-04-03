import { redirect } from "next/navigation";

import { validateRequest } from "@/lib/auth/validate-request";

import { MemberSecurityForm } from "@/features/member-portal/components/member-security-form";

export default async function MemberSecurityPage(): Promise<React.ReactElement> {
	const { user } = await validateRequest();
	if (!user) {
		redirect("/login");
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-xl font-bold tracking-tight text-white">Seguridad</h1>
				<p className="mt-1 text-sm text-white/55">
					Protege tu cuenta del portal con una contraseña personal.
				</p>
			</div>

			<div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
				<MemberSecurityForm passwordIsDefault={user.passwordIsDefault} />
			</div>
		</div>
	);
}
