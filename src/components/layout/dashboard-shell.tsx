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
		<div className="min-h-screen bg-slate-950">
			<DashboardSidebar />
			<div className="md:pl-72">
				<DashboardHeader user={user} notificationAlerts={notificationAlerts} />
				<main className="p-4 md:p-6">{children}</main>
			</div>
		</div>
	);
}
