"use client";

import type { User as LuciaUser } from "@/lib/auth/auth";

import { AppLogo } from "@/components/branding/app-logo";
import { UserMenu } from "@/components/layout/user-menu";

export interface MemberHeaderProps {
	user: LuciaUser;
}

export function MemberHeader({ user }: MemberHeaderProps): React.ReactElement {
	return (
		<header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-black/80 px-4 backdrop-blur-md md:h-16 md:px-6">
			<AppLogo size="md" href="/dashboard/member" priority />
			<UserMenu user={user} />
		</header>
	);
}
