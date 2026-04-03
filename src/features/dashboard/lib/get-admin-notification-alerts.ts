import { format } from "date-fns";
import { es } from "date-fns/locale";

import { getMembers } from "@/features/members/lib/get-members";
import { isExpiringSoon } from "@/features/members/lib/expiry-alert";
import { isMembershipActiveFromEndDate } from "@/features/member-portal/lib/subscription-status";

const MAX_ITEMS = 20;
const MEMBERS_HREF = "/dashboard/members";

export type AdminNotificationKind = "expiring_soon" | "expired" | "past_due";

export type AdminNotificationItem = {
	id: string;
	memberId: string;
	kind: AdminNotificationKind;
	title: string;
	subtitle: string;
	href: string;
};

export type AdminNotificationAlerts = {
	items: AdminNotificationItem[];
	/** Número de alertas (para badge); coincide con items.length salvo límite. */
	totalCount: number;
};

function sortItems(a: AdminNotificationItem, b: AdminNotificationItem): number {
	const order = (k: AdminNotificationKind) =>
		k === "expiring_soon" ? 0 : k === "past_due" ? 1 : 2;
	const d = order(a.kind) - order(b.kind);
	if (d !== 0) {
		return d;
	}
	return a.title.localeCompare(b.title, "es");
}

/**
 * Alertas operativas para el panel admin: por vencer, vencidas/sin plan, past_due con vigencia.
 */
export async function getAdminNotificationAlerts(): Promise<AdminNotificationAlerts> {
	const rows = await getMembers();
	const raw: AdminNotificationItem[] = [];

	for (const m of rows) {
		if (m.status === "inactive") {
			continue;
		}
		const end = m.subscriptionEndDate;
		const calActive = isMembershipActiveFromEndDate(end);

		if (calActive && end && isExpiringSoon(end) && m.status === "active") {
			raw.push({
				id: `${m.id}-expiring`,
				memberId: m.id,
				kind: "expiring_soon",
				title: m.fullName,
				subtitle: `Por vencer · ${format(end, "d MMM yyyy", { locale: es })}`,
				href: MEMBERS_HREF,
			});
			continue;
		}

		if (!calActive) {
			raw.push({
				id: `${m.id}-expired`,
				memberId: m.id,
				kind: "expired",
				title: m.fullName,
				subtitle: end
					? `Membresía vencida · ${format(end, "d MMM yyyy", { locale: es })}`
					: "Sin plan o membresía vencida",
				href: MEMBERS_HREF,
			});
			continue;
		}

		if (m.status === "past_due") {
			raw.push({
				id: `${m.id}-past_due`,
				memberId: m.id,
				kind: "past_due",
				title: m.fullName,
				subtitle: end
					? `Pago pendiente · vigente hasta ${format(end, "d MMM yyyy", { locale: es })}`
					: "Pago pendiente — revisar socio",
				href: MEMBERS_HREF,
			});
		}
	}

	raw.sort(sortItems);
	const totalCount = raw.length;
	const items = raw.slice(0, MAX_ITEMS);

	return { items, totalCount };
}
