import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { validateRequest } from "@/lib/auth/validate-request";
import { db } from "@/server/db/client";
import { DATABASE_CONNECTION_ERROR } from "@/server/db/env";
import { pushSubscriptions } from "@/server/db/schema/gym-schema";
import { getVapidPublicKey } from "@/server/push/web-push-config";

export const dynamic = "force-dynamic";

const subscriptionSchema = z.object({
	endpoint: z.string().url(),
	expirationTime: z.number().nullable().optional(),
	keys: z.object({
		p256dh: z.string().min(1),
		auth: z.string().min(1),
	}),
});

const unsubscribeSchema = z.object({
	endpoint: z.string().url(),
});

export async function POST(req: Request): Promise<NextResponse> {
	if (!getVapidPublicKey()) {
		return NextResponse.json(
			{ error: "Web Push no está configurado." },
			{ status: 503 },
		);
	}

	const { user } = await validateRequest();
	if (!user || user.role !== "member") {
		return NextResponse.json({ error: "No autorizado." }, { status: 401 });
	}

	let json: unknown;
	try {
		json = await req.json();
	} catch {
		return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
	}

	const parsed = subscriptionSchema.safeParse(json);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Suscripción inválida." },
			{ status: 400 },
		);
	}

	const sub = parsed.data;

	try {
		await db
			.insert(pushSubscriptions)
			.values({
				userId: user.id,
				endpoint: sub.endpoint,
				p256dh: sub.keys.p256dh,
				auth: sub.keys.auth,
			})
			.onConflictDoUpdate({
				target: pushSubscriptions.endpoint,
				set: {
					userId: user.id,
					p256dh: sub.keys.p256dh,
					auth: sub.keys.auth,
				},
			});
		return NextResponse.json({ ok: true });
	} catch (err) {
		if (process.env.NODE_ENV === "development") {
			console.error("[POST /api/push/subscribe]", err);
		}
		return NextResponse.json(
			{ error: DATABASE_CONNECTION_ERROR },
			{ status: 500 },
		);
	}
}

export async function DELETE(req: Request): Promise<NextResponse> {
	const { user } = await validateRequest();
	if (!user) {
		return NextResponse.json({ error: "No autorizado." }, { status: 401 });
	}

	let json: unknown;
	try {
		json = await req.json();
	} catch {
		return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
	}

	const parsed = unsubscribeSchema.safeParse(json);
	if (!parsed.success) {
		return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
	}

	try {
		await db
			.delete(pushSubscriptions)
			.where(
				and(
					eq(pushSubscriptions.endpoint, parsed.data.endpoint),
					eq(pushSubscriptions.userId, user.id),
				),
			);
		return NextResponse.json({ ok: true });
	} catch (err) {
		if (process.env.NODE_ENV === "development") {
			console.error("[DELETE /api/push/subscribe]", err);
		}
		return NextResponse.json(
			{ error: DATABASE_CONNECTION_ERROR },
			{ status: 500 },
		);
	}
}
