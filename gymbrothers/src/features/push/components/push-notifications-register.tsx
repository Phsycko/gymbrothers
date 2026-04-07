"use client";

import { Bell, X } from "lucide-react";
import { type ReactElement, useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

function urlBase64ToUint8Array(base64String: string): BufferSource {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
	const rawData = atob(base64);
	const buffer = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; i++) {
		buffer[i] = rawData.charCodeAt(i);
	}
	return buffer;
}

async function subscribeWithVapid(
	reg: ServiceWorkerRegistration,
	vapidPublicKey: string,
): Promise<PushSubscription | null> {
	const sub = await reg.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
	});
	const res = await fetch("/api/push/subscribe", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "same-origin",
		body: JSON.stringify(sub.toJSON()),
	});
	if (!res.ok) {
		await sub.unsubscribe().catch(() => undefined);
		return null;
	}
	return sub;
}

export function PushNotificationsRegister({
	audience = "member",
}: {
	/** Socios: avisos del gym. Staff: averías nuevas y actualizaciones operativas. */
	audience?: "member" | "staff";
} = {}): ReactElement | null {
	const [supported, setSupported] = useState(false);
	const [dismissed, setDismissed] = useState(false);
	const [busy, setBusy] = useState(false);
	const [permission, setPermission] = useState<NotificationPermission | null>(
		null,
	);

	useEffect(() => {
		const ok =
			typeof window !== "undefined" &&
			"serviceWorker" in navigator &&
			"PushManager" in window &&
			"Notification" in window;
		setSupported(ok);
		if (ok && typeof Notification !== "undefined") {
			setPermission(Notification.permission);
		}
	}, []);

	const trySubscribe = useCallback(
		async (promptUser: boolean): Promise<void> => {
			if (!supported) {
				return;
			}

			const keyRes = await fetch("/api/push/vapid-public-key", {
				credentials: "same-origin",
			});
			if (!keyRes.ok) {
				return;
			}
			const { publicKey } = (await keyRes.json()) as { publicKey?: string };
			if (!publicKey) {
				return;
			}

			let permission = Notification.permission;
			if (permission === "default" && promptUser) {
				permission = await Notification.requestPermission();
			}
			if (permission !== "granted") {
				return;
			}

			const reg = await navigator.serviceWorker.ready;
			let sub = await reg.pushManager.getSubscription();
			if (!sub) {
				sub = await subscribeWithVapid(reg, publicKey);
			} else {
				const ok = await fetch("/api/push/subscribe", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "same-origin",
					body: JSON.stringify(sub.toJSON()),
				});
				if (!ok.ok) {
					await sub.unsubscribe().catch(() => undefined);
					await subscribeWithVapid(reg, publicKey);
				}
			}
		},
		[supported],
	);

	useEffect(() => {
		if (!supported) {
			return;
		}

		void (async () => {
			if (Notification.permission !== "granted") {
				return;
			}
			setPermission("granted");
			setBusy(true);
			try {
				await trySubscribe(false);
			} finally {
				setBusy(false);
			}
		})();
	}, [supported, trySubscribe]);

	if (!supported || dismissed || permission === null) {
		return null;
	}

	if (permission === "denied") {
		return null;
	}

	if (permission === "granted") {
		return null;
	}

	const positionClass = audience === "staff" ? "bottom-6" : "bottom-20";
	const blurb =
		audience === "staff"
			? "Recibe en este dispositivo las averías que reporten los socios y otras alertas del panel."
			: "Recibe avisos del gimnasio en tu pantalla de inicio como una app.";

	return (
		<section
			className={`fixed ${positionClass} left-3 right-3 z-50 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-slate-950/95 px-4 py-3 text-sm text-slate-100 shadow-lg backdrop-blur md:left-auto md:right-6 md:max-w-md`}
			aria-label="Activar notificaciones"
		>
			<Bell className="h-5 w-5 shrink-0 text-rose-400" aria-hidden />
			<p className="min-w-0 flex-1 leading-snug">{blurb}</p>
			<Button
				type="button"
				size="sm"
				className="shrink-0"
				disabled={busy}
				onClick={() => {
					setBusy(true);
					void (async () => {
						try {
							await trySubscribe(true);
							if (typeof Notification !== "undefined") {
								setPermission(Notification.permission);
							}
						} finally {
							setBusy(false);
						}
					})();
				}}
			>
				Activar
			</Button>
			<button
				type="button"
				className="rounded p-1 text-slate-400 hover:text-white"
				aria-label="Cerrar"
				onClick={() => setDismissed(true)}
			>
				<X className="h-4 w-4" />
			</button>
		</section>
	);
}
