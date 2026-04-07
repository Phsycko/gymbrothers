import { eq } from "drizzle-orm";

import { db } from "@/server/db/client";
import { pushSubscriptions } from "@/server/db/schema/gym-schema";

import {
	ensureWebPushConfigured,
	isWebPushConfigured,
	webpush,
} from "./web-push-config";

export type PushPayload = {
	title: string;
	body: string;
	/** Path or full URL opened on notification tap */
	url?: string;
};

export async function removeSubscriptionByEndpoint(
	endpoint: string,
): Promise<void> {
	await db
		.delete(pushSubscriptions)
		.where(eq(pushSubscriptions.endpoint, endpoint));
}

export async function sendWebPushToEndpoint(
	endpoint: string,
	keys: { p256dh: string; auth: string },
	payload: PushPayload,
): Promise<void> {
	ensureWebPushConfigured();
	if (!isWebPushConfigured()) {
		return;
	}

	const subscription = {
		endpoint,
		keys: {
			p256dh: keys.p256dh,
			auth: keys.auth,
		},
	};

	const body = JSON.stringify({
		title: payload.title,
		body: payload.body,
		url: payload.url ?? "/dashboard/member",
	});

	try {
		await webpush.sendNotification(subscription, body, {
			TTL: 86_400,
			urgency: "normal",
		});
	} catch (err: unknown) {
		const status =
			typeof err === "object" && err && "statusCode" in err
				? (err as { statusCode?: number }).statusCode
				: undefined;
		if (status === 404 || status === 410) {
			await removeSubscriptionByEndpoint(endpoint);
		} else if (process.env.NODE_ENV === "development") {
			console.error("[sendWebPushToEndpoint]", err);
		}
	}
}
