"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

import type { Result } from "@/core/result";
import { lucia } from "@/lib/auth/auth";
import { hashPassword } from "@/lib/auth/password";
import {
	isValidUsernameFormat,
	sanitizeUsername,
} from "@/lib/auth/username";
import { validateRequest } from "@/lib/auth/validate-request";
import { db } from "@/server/db/client";
import {
	DATABASE_CONNECTION_ERROR,
	DATABASE_URL_MISSING_MESSAGE,
	isDatabaseConfigured,
} from "@/server/db/env";
import { users } from "@/server/db/schema/gym-schema";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface SignUpInput {
	username: string;
	email: string;
	password: string;
	role: "owner" | "staff";
}

/**
 * Registers a new staff or owner account with a unique username.
 */
export async function signUpAction(
	input: SignUpInput,
): Promise<Result<{ userId: string }>> {
	const auth = await validateRequest();
	if (auth.user) {
		return { data: null, error: "Already signed in" };
	}

	const username = sanitizeUsername(input.username);
	const email = input.email.trim().toLowerCase();
	const password = input.password;
	const role = input.role;

	if (!isValidUsernameFormat(username)) {
		return {
			data: null,
			error: "Usuario inválido (3–64 caracteres: letras, números, . _ -)",
		};
	}
	if (!EMAIL_RE.test(email) || email.length > 320) {
		return { data: null, error: "Invalid email" };
	}
	if (password.length < 8 || password.length > 128) {
		return {
			data: null,
			error: "Password must be between 8 and 128 characters",
		};
	}
	if (role !== "owner" && role !== "staff") {
		return { data: null, error: "Invalid role" };
	}

	if (!isDatabaseConfigured()) {
		return { data: null, error: DATABASE_URL_MISSING_MESSAGE };
	}

	try {
		const takenName = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.username, username))
			.limit(1);
		if (takenName.length > 0) {
			return { data: null, error: "Username already taken" };
		}

		const takenEmail = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, email))
			.limit(1);
		if (takenEmail.length > 0) {
			return { data: null, error: "Email already registered" };
		}

		const hashedPassword = await hashPassword(password);

		const [row] = await db
			.insert(users)
			.values({
				username,
				email,
				hashedPassword,
				passwordIsDefault: false,
				role,
			})
			.returning({ id: users.id });

		if (!row) {
			return { data: null, error: "Could not create account" };
		}

		const session = await lucia.createSession(row.id, {});
		const cookieStore = await cookies();
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookieStore.set(
			sessionCookie.name,
			sessionCookie.value,
			sessionCookie.attributes,
		);

		return { data: { userId: row.id }, error: null };
	} catch {
		return { data: null, error: DATABASE_CONNECTION_ERROR };
	}
}
