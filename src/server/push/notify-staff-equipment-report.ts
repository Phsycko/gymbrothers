import { eq, inArray } from "drizzle-orm";

import { db } from "@/server/db/client";
import { pushSubscriptions, users } from "@/server/db/schema/gym-schema";

import { sendWebPushToEndpoint } from "./send-web-push";
import { isWebPushConfigured } from "./web-push-config";

function excerpt(text: string, max: number): string {
	const t = text.replace(/\s+/g, " ").trim();
	if (t.length <= max) {
		return t;
	}
	return `${t.slice(0, max - 1)}…`;
}

function priorityShort(p: "low" | "medium" | "high" | undefined): string {
	if (p === "high") {
		return "Alta";
	}
	if (p === "low") {
		return "Baja";
	}
	return "Media";
}

/**
 * Notifica a owner/staff con push registrado: nuevo reporte de avería desde Comunidad.
 */
export async function notifyStaffNewEquipmentReport(input: {
	machineName: string;
	message: string;
	priority?: "low" | "medium" | "high";
}): Promise<void> {
	if (!isWebPushConfigured()) {
		return;
	}

	const pri = priorityShort(input.priority);
	const body = excerpt(`[Prioridad ${pri}] ${input.message}`, 160);
	const title = `[${pri}] ${input.machineName}`;

	const rows = await db
		.select({
			endpoint: pushSubscriptions.endpoint,
			p256dh: pushSubscriptions.p256dh,
			auth: pushSubscriptions.auth,
		})
		.from(pushSubscriptions)
		.innerJoin(users, eq(pushSubscriptions.userId, users.id))
		.where(inArray(users.role, ["owner", "staff"]));

	await Promise.all(
		rows.map((row) =>
			sendWebPushToEndpoint(
				row.endpoint,
				{ p256dh: row.p256dh, auth: row.auth },
				{
					title,
					body: body || "Nuevo reporte de equipamiento",
					url: "/dashboard/equipment-reports",
				},
			),
		),
	);
}
