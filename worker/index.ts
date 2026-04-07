// @ts-nocheck — compiled as a separate webpack entry; DOM/SW types are not aligned with this context.

type PushPayload = {
	title?: string;
	body?: string;
	url?: string;
};

const sw = self;

sw.addEventListener("push", (event: ExtendableEvent) => {
	const pushEvent = event as PushEvent;
	let data: PushPayload = {};
	try {
		if (pushEvent.data) {
			data = pushEvent.data.json() as PushPayload;
		}
	} catch {
		const t = pushEvent.data?.text();
		data = { body: t ?? "" };
	}

	const title = data.title ?? "GYM BROTHERS";
	const openUrl = data.url ?? "/dashboard/member";
	const options: NotificationOptions = {
		body: data.body ?? "",
		icon: "/icons/icon-192.png",
		badge: "/icons/icon-192.png",
		data: { url: openUrl },
		tag: "gym-brothers",
		renotify: true,
	};

	pushEvent.waitUntil(sw.registration.showNotification(title, options));
});

sw.addEventListener("notificationclick", (event: NotificationEvent) => {
	event.notification.close();
	const data = event.notification.data as { url?: string } | undefined;
	const pathOrUrl = data?.url ?? "/dashboard/member";
	const url = new URL(pathOrUrl, sw.location.origin).href;

	event.waitUntil(
		sw.clients
			.matchAll({ type: "window", includeUncontrolled: true })
			.then((clientList) => {
				for (const client of clientList) {
					const c = client as WindowClient;
					if (c.url.startsWith(sw.location.origin)) {
						if (typeof c.navigate === "function") {
							void c.navigate(url);
						}
						return c.focus();
					}
				}
				return sw.clients.openWindow?.(url);
			}),
	);
});
