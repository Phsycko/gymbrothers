"use client";

import type { ReactNode } from "react";

import type { User as LuciaUser } from "@/lib/auth/auth";

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export interface DashboardShellProps {
	user: LuciaUser;
	children: ReactNode;
}

export function DashboardShell({
	user,
	children,
}: DashboardShellProps): React.ReactElement {
	return (
		<div className="min-h-screen bg-slate-950">
			<DashboardSidebar />
			<div className="md:pl-72">
				<DashboardHeader user={user} />
				<main className="p-4 md:p-6">{children}</main>
			</div>
		</div>
	);
}
