"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

import type { Result } from "@/core/result";
import { lucia } from "@/lib/auth/auth";
import {
	isValidUsernameFormat,
	sanitizeUsername,
} from "@/lib/auth/username";
import { verifyPassword } from "@/lib/auth/password";
import { validateRequest } from "@/lib/auth/validate-request";
import { db } from "@/server/db/client";
import {
	DATABASE_CONNECTION_ERROR,
	DATABASE_URL_MISSING_MESSAGE,
	isDatabaseConfigured,
} from "@/server/db/env";
import { users } from "@/server/db/schema/gym-schema";

export interface LoginInput {
	username: string;
	password: string;
}

const GENERIC_LOGIN_ERROR = "Usuario o contraseña incorrectos.";

/**
 * Validates credentials by username, creates a Lucia session, and sets the session cookie.
 */
export async function loginAction(
	input: LoginInput,
): Promise<Result<{ userId: string; role: string }>> {
	const auth = await validateRequest();
	if (auth.user) {
		return { data: null, error: "Already signed in" };
	}

	const username = sanitizeUsername(input.username);
	const password = input.password;

	if (!isValidUsernameFormat(username)) {
		return { data: null, error: GENERIC_LOGIN_ERROR };
	}
	if (password.length === 0) {
		return { data: null, error: GENERIC_LOGIN_ERROR };
	}

	if (!isDatabaseConfigured()) {
		return { data: null, error: DATABASE_URL_MISSING_MESSAGE };
	}

	try {
		const [row] = await db
			.select({
				id: users.id,
				hashedPassword: users.hashedPassword,
				role: users.role,
			})
			.from(users)
			.where(eq(users.username, username))
			.limit(1);

		if (!row) {
			return { data: null, error: GENERIC_LOGIN_ERROR };
		}

		const ok = await verifyPassword(row.hashedPassword, password);
		if (!ok) {
			return { data: null, error: GENERIC_LOGIN_ERROR };
		}

		const session = await lucia.createSession(row.id, {});
		const cookieStore = await cookies();
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookieStore.set(
			sessionCookie.name,
			sessionCookie.value,
			sessionCookie.attributes,
		);

		return { data: { userId: row.id, role: row.role }, error: null };
	} catch {
		return { data: null, error: DATABASE_CONNECTION_ERROR };
	}
}
