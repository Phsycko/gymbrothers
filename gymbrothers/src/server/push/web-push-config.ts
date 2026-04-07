import webpush from "web-push";

let configured = false;

export function isWebPushConfigured(): boolean {
	const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
	const privateKey = process.env.VAPID_PRIVATE_KEY;
	return Boolean(publicKey && privateKey);
}

export function getVapidPublicKey(): string | null {
	return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null;
}

export function ensureWebPushConfigured(): void {
	if (configured || !isWebPushConfigured()) {
		return;
	}
	const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
	const privateKey = process.env.VAPID_PRIVATE_KEY;
	const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@localhost";
	if (!publicKey || !privateKey) {
		return;
	}
	webpush.setVapidDetails(subject, publicKey, privateKey);
	configured = true;
}

export { webpush };
