import { eq } from "drizzle-orm";

import { db } from "@/server/db/client";
import { pushSubscriptions, users } from "@/server/db/schema/gym-schema";

import { sendWebPushToEndpoint } from "./send-web-push";
import { isWebPushConfigured } from "./web-push-config";

function excerptFromAnnouncementContent(content: string): string {
	const plain = content
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	if (plain.length <= 180) {
		return plain;
	}
	return `${plain.slice(0, 177)}…`;
}

/**
 * Sends a Web Push to every subscribed member (installed PWA / browser push).
 * Safe to fire-and-forget; logs in development on failure.
 */
export async function notifyMembersNewAnnouncement(input: {
	title: string;
	content: string;
}): Promise<void> {
	if (!isWebPushConfigured()) {
		return;
	}

	const body = excerptFromAnnouncementContent(input.content);

	const rows = await db
		.select({
			endpoint: pushSubscriptions.endpoint,
			p256dh: pushSubscriptions.p256dh,
			auth: pushSubscriptions.auth,
		})
		.from(pushSubscriptions)
		.innerJoin(users, eq(pushSubscriptions.userId, users.id))
		.where(eq(users.role, "member"));

	await Promise.all(
		rows.map((row) =>
			sendWebPushToEndpoint(
				row.endpoint,
				{ p256dh: row.p256dh, auth: row.auth },
				{
					title: input.title,
					body: body || "Nuevo anuncio en GYM BROTHERS",
					url: "/dashboard/member",
				},
			),
		),
	);
}
