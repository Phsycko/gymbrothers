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
		<div className="min-h-screen min-w-0 bg-black text-white">
			<MemberHeader user={user} />
			<main className="mx-auto w-full min-w-0 max-w-lg px-4 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] pt-4 sm:px-5 md:max-w-2xl md:px-6 md:pb-[calc(6rem+env(safe-area-inset-bottom,0px))] lg:max-w-4xl xl:max-w-5xl">
				{children}
			</main>
			<MemberBottomNav />
		</div>
	);
}
