"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/server/db/client";
import { DATABASE_CONNECTION_ERROR } from "@/server/db/env";
import { announcements } from "@/server/db/schema/gym-schema";
import { notifyMembersNewAnnouncement } from "@/server/push/notify-announcement";

const createAnnouncementSchema = z.object({
	title: z.string().trim().min(1, "Título requerido").max(255),
	content: z.string().trim().min(1, "Contenido requerido").max(16_000),
	priority: z.enum(["low", "medium", "high"]),
	category: z.enum(["event", "maintenance", "promotion"]),
});

const deleteAnnouncementSchema = z.object({
	id: z.string().uuid(),
});

export type AnnouncementActionResult =
	| { ok: true }
	| { ok: false; error: string };

export async function createAnnouncementAction(
	input: unknown,
): Promise<AnnouncementActionResult> {
	const parsed = createAnnouncementSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "Datos inválidos." };
	}

	try {
		await db.insert(announcements).values(parsed.data);
		revalidatePath("/dashboard/announcements");
		void notifyMembersNewAnnouncement({
			title: parsed.data.title,
			content: parsed.data.content,
		}).catch((err) => {
			if (process.env.NODE_ENV === "development") {
				console.error("[notifyMembersNewAnnouncement]", err);
			}
		});
		return { ok: true };
	} catch (err) {
		if (process.env.NODE_ENV === "development") {
			console.error("[createAnnouncementAction]", err);
		}
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}

export async function deleteAnnouncementAction(
	input: unknown,
): Promise<AnnouncementActionResult> {
	const parsed = deleteAnnouncementSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "ID inválido." };
	}

	try {
		const removed = await db
			.delete(announcements)
			.where(eq(announcements.id, parsed.data.id))
			.returning({ id: announcements.id });

		if (removed.length === 0) {
			return { ok: false, error: "Anuncio no encontrado." };
		}

		revalidatePath("/dashboard/announcements");
		return { ok: true };
	} catch (err) {
		if (process.env.NODE_ENV === "development") {
			console.error("[deleteAnnouncementAction]", err);
		}
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}
