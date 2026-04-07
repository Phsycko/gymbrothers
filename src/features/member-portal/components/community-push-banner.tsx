"use client";

import { Bell, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

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

export function CommunityPushBanner({
	initialSubscribed,
	vapidConfigured,
}: {
	/** Desde servidor: si ya hay filas en push_subscriptions para este usuario. */
	initialSubscribed: boolean;
	/** Servidor: NEXT_PUBLIC_VAPID_PUBLIC_KEY presente. */
	vapidConfigured: boolean;
}): React.ReactElement | null {
	const router = useRouter();
	const [subscribed, setSubscribed] = useState(initialSubscribed);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		setSubscribed(initialSubscribed);
	}, [initialSubscribed]);

	const trySubscribe = useCallback(async (): Promise<boolean> => {
		const keyRes = await fetch("/api/push/vapid-public-key", {
			credentials: "same-origin",
		});
		if (!keyRes.ok) {
			return false;
		}
		const { publicKey } = (await keyRes.json()) as { publicKey?: string };
		if (!publicKey) {
			return false;
		}

		let permission = Notification.permission;
		if (permission === "default") {
			permission = await Notification.requestPermission();
		}
		if (permission !== "granted") {
			if (permission === "denied") {
				toast.error(
					"Las notificaciones están bloqueadas. Actívalas en ajustes del navegador.",
				);
			}
			return false;
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
				sub = await subscribeWithVapid(reg, publicKey);
			}
		}
		return sub != null;
	}, []);

	if (!vapidConfigured || subscribed) {
		return null;
	}

	return (
		<div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-zinc-900/90 via-black to-zinc-950 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
			<div
				className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#E11D48]/15 blur-2xl"
				aria-hidden
			/>
			<div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex gap-4">
					<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-inner">
						<Bell className="h-6 w-6 text-[#E11D48]" aria-hidden />
					</div>
					<div className="min-w-0">
						<p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
							<Sparkles className="h-3.5 w-3.5 text-amber-400/80" aria-hidden />
							Tiempo real
						</p>
						<p className="mt-1.5 text-sm font-medium leading-snug text-white/90">
							¿Quieres recibir avisos de mantenimiento y noticias del gym en
							tiempo real?
						</p>
					</div>
				</div>
				<Button
					type="button"
					disabled={busy}
					onClick={() => {
						setBusy(true);
						void (async () => {
							try {
								const ok = await trySubscribe();
								if (ok) {
									setSubscribed(true);
									toast.success("Notificaciones activadas.");
									router.refresh();
								} else if (Notification.permission !== "denied") {
									toast.error("No se pudo activar. Inténtalo de nuevo.");
								}
							} finally {
								setBusy(false);
							}
						})();
					}}
					className="h-11 shrink-0 border border-[#E11D48]/35 bg-[#E11D48] px-6 text-white shadow-[0_0_20px_-4px_rgba(225,29,72,0.5)] hover:bg-[#BE123C] sm:min-w-[200px]"
				>
					{busy ? "Activando…" : "Activar notificaciones"}
				</Button>
			</div>
		</div>
	);
}
