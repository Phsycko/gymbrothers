import { validateRequest } from "@/lib/auth/validate-request";

import { MemberProfileContent } from "@/features/member-portal/components/member-profile-content";

export default async function MemberProfilePage(): Promise<React.ReactElement> {
	const { user } = await validateRequest();
	if (!user) {
		return <div className="text-white/60">Cargando…</div>;
	}
	return (
		<MemberProfileContent
			userId={user.id}
			userEmail={user.email}
			username={user.username}
			passwordIsDefault={user.passwordIsDefault}
		/>
	);
}
