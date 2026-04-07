import { eq } from "drizzle-orm";

import {
	type EquipmentReportStatus,
	equipmentReportStatusLabelEs,
} from "@/features/member-portal/lib/equipment-report-status";
import { db } from "@/server/db/client";
import { pushSubscriptions } from "@/server/db/schema/gym-schema";

import { sendWebPushToEndpoint } from "./send-web-push";
import { isWebPushConfigured } from "./web-push-config";

/**
 * Notifica al socio que reportó la avería cuando el staff actualiza estado o nota.
 */
export async function notifyMemberEquipmentReportUpdate(input: {
	reporterUserId: string;
	machineName: string;
	status: EquipmentReportStatus;
	staffNote: string | null;
}): Promise<void> {
	if (!isWebPushConfigured()) {
		return;
	}

	const statusLabel = equipmentReportStatusLabelEs(input.status);
	let body = `Estado: ${statusLabel}`;
	if (input.staffNote?.trim()) {
		body = `${body}. ${input.staffNote.trim()}`;
	}
	const title = `Tu reporte: ${input.machineName}`;

	const rows = await db
		.select({
			endpoint: pushSubscriptions.endpoint,
			p256dh: pushSubscriptions.p256dh,
			auth: pushSubscriptions.auth,
		})
		.from(pushSubscriptions)
		.where(eq(pushSubscriptions.userId, input.reporterUserId));

	await Promise.all(
		rows.map((row) =>
			sendWebPushToEndpoint(
				row.endpoint,
				{ p256dh: row.p256dh, auth: row.auth },
				{
					title,
					body,
					url: "/dashboard/member/community",
				},
			),
		),
	);
}
