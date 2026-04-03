import { validateRequest } from "@/lib/auth/validate-request";

import { MemberHomeContent } from "@/features/member-portal/components/member-home-content";

export default async function MemberHomePage(): Promise<React.ReactElement> {
	const { user } = await validateRequest();
	if (!user) {
		return <div className="text-white/60">Cargando…</div>;
	}
	return (
		<MemberHomeContent
			userId={user.id}
			userEmail={user.email}
			passwordIsDefault={user.passwordIsDefault}
		/>
	);
}
