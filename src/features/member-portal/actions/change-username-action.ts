"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { isValidUsernameFormat, sanitizeUsername } from "@/lib/auth/username";
import { validateRequest } from "@/lib/auth/validate-request";
import { db } from "@/server/db/client";
import { DATABASE_CONNECTION_ERROR } from "@/server/db/env";
import { users } from "@/server/db/schema/gym-schema";

export type ChangeUsernameResult = { ok: true } | { ok: false; error: string };

function isUniqueViolation(err: unknown): boolean {
	return (
		typeof err === "object" &&
		err !== null &&
		"code" in err &&
		(err as { code?: string }).code === "23505"
	);
}

/**
 * Lets the signed-in **member** change their login username (3–64 chars, a-z 0-9 . _ -).
 */
export async function changeUsernameAction(
	input: unknown,
): Promise<ChangeUsernameResult> {
	const { user } = await validateRequest();
	if (!user || user.role !== "member") {
		return { ok: false, error: "No autorizado." };
	}

	if (typeof input !== "object" || input === null || !("username" in input)) {
		return { ok: false, error: "Datos inválidos." };
	}
	const raw = (input as { username: unknown }).username;
	if (typeof raw !== "string") {
		return { ok: false, error: "Datos inválidos." };
	}

	const next = sanitizeUsername(raw);
	if (!isValidUsernameFormat(next)) {
		return {
			ok: false,
			error:
				"Usa entre 3 y 64 caracteres: letras minúsculas, números, punto, guion bajo o guion.",
		};
	}

	if (next === user.username) {
		return { ok: true };
	}

	try {
		const [taken] = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.username, next))
			.limit(1);

		if (taken && taken.id !== user.id) {
			return { ok: false, error: "Ese nombre de usuario ya está en uso." };
		}

		await db.update(users).set({ username: next }).where(eq(users.id, user.id));

		revalidatePath("/dashboard/member/profile");
		revalidatePath("/dashboard/member");
		return { ok: true };
	} catch (err) {
		if (isUniqueViolation(err)) {
			return { ok: false, error: "Ese nombre de usuario ya está en uso." };
		}
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}
