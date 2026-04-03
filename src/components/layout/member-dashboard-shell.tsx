"use client";

import type { ReactNode } from "react";

import type { User as LuciaUser } from "@/lib/auth/auth";

import { MemberBottomNav } from "@/components/layout/member-bottom-nav";
import { MemberHeader } from "@/components/layout/member-header";

export interface MemberDashboardShellProps {
	user: LuciaUser;
	children: ReactNode;
}

export function MemberDashboardShell({
	user,
	children,
}: MemberDashboardShellProps): React.ReactElement {
	return (
		<div className="min-h-screen bg-black text-white">
			<MemberHeader user={user} />
			<main className="mx-auto w-full max-w-lg px-4 pb-28 pt-4 md:max-w-2xl md:px-6 md:pb-24">
				{children}
			</main>
			<MemberBottomNav />
		</div>
	);
}
