"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { z } from "zod";

import { lucia } from "@/lib/auth/auth";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { validateRequest } from "@/lib/auth/validate-request";
import { db } from "@/server/db/client";
import { DATABASE_CONNECTION_ERROR } from "@/server/db/env";
import { users } from "@/server/db/schema/gym-schema";

const schema = z.object({
	currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
	newPassword: z.string().min(8, "Mínimo 8 caracteres").max(128),
});

export type ChangePasswordResult =
	| { ok: true }
	| { ok: false; error: string };

/**
 * Lets the signed-in user rotate their password (members and staff).
 */
export async function changePasswordAction(
	input: unknown,
): Promise<ChangePasswordResult> {
	const { user } = await validateRequest();
	if (!user) {
		return { ok: false, error: "Inicia sesión para continuar." };
	}

	const parsed = schema.safeParse(input);
	if (!parsed.success) {
		const msg = parsed.error.flatten().fieldErrors.newPassword?.[0]
			?? parsed.error.flatten().fieldErrors.currentPassword?.[0]
			?? "Datos inválidos";
		return { ok: false, error: msg };
	}

	const { currentPassword, newPassword } = parsed.data;
	if (currentPassword === newPassword) {
		return { ok: false, error: "La nueva contraseña debe ser distinta a la actual." };
	}

	try {
		const [row] = await db
			.select({
				id: users.id,
				hashedPassword: users.hashedPassword,
			})
			.from(users)
			.where(eq(users.id, user.id))
			.limit(1);

		if (!row) {
			return { ok: false, error: "Cuenta no encontrada." };
		}

		const ok = await verifyPassword(row.hashedPassword, currentPassword);
		if (!ok) {
			return { ok: false, error: "La contraseña actual no es correcta." };
		}

		const hashed = await hashPassword(newPassword);
		await db
			.update(users)
			.set({
				hashedPassword: hashed,
				passwordIsDefault: false,
			})
			.where(eq(users.id, user.id));

		await lucia.invalidateUserSessions(user.id);
		const cookieStore = await cookies();
		const blank = lucia.createBlankSessionCookie();
		cookieStore.set(blank.name, blank.value, blank.attributes);

		return { ok: true };
	} catch {
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}
