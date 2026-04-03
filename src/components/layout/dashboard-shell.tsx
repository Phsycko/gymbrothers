"use client";

import type { ReactNode } from "react";

import type { User as LuciaUser } from "@/lib/auth/auth";
import type { AdminNotificationAlerts } from "@/features/dashboard/lib/get-admin-notification-alerts";

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export interface DashboardShellProps {
	user: LuciaUser;
	notificationAlerts: AdminNotificationAlerts;
	children: ReactNode;
}

export function DashboardShell({
	user,
	notificationAlerts,
	children,
}: DashboardShellProps): React.ReactElement {
	return (
		<div className="min-h-screen min-w-0 bg-slate-950">
			<DashboardSidebar />
			<div className="min-w-0 md:pl-72">
				<DashboardHeader user={user} notificationAlerts={notificationAlerts} />
				<main className="min-w-0 px-3 pb-6 pt-4 sm:px-4 md:p-6 md:pb-8">
					{children}
				</main>
			</div>
		</div>
	);
}
