import { cache } from "react";

import { cookies } from "next/headers";

import { type Session, type User, lucia } from "@/lib/auth/auth";
import { isDatabaseConfigured } from "@/server/db/env";

export interface ValidateRequestResult {
	user: User | null;
	session: Session | null;
}

/**
 * Reads the session cookie, validates the session against the database, and refreshes
 * the cookie when Lucia extends expiration (`session.fresh`). Safe to call from Server
 * Components and Server Actions (cookie updates are wrapped in try/catch per Next.js limits).
 */
export const validateRequest = cache(
	async (): Promise<ValidateRequestResult> => {
		const cookieStore = await cookies();
		const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;
		if (!sessionId) {
			return { user: null, session: null };
		}

		if (!isDatabaseConfigured()) {
			try {
				const blank = lucia.createBlankSessionCookie();
				cookieStore.set(blank.name, blank.value, blank.attributes);
			} catch {
				// ignore
			}
			return { user: null, session: null };
		}

		let result: Awaited<ReturnType<typeof lucia.validateSession>>;
		try {
			result = await lucia.validateSession(sessionId);
		} catch {
			try {
				const blank = lucia.createBlankSessionCookie();
				cookieStore.set(blank.name, blank.value, blank.attributes);
			} catch {
				// ignore
			}
			return { user: null, session: null };
		}

		try {
			if (result.session?.fresh) {
				const sessionCookie = lucia.createSessionCookie(result.session.id);
				cookieStore.set(
					sessionCookie.name,
					sessionCookie.value,
					sessionCookie.attributes,
				);
			}
			if (!result.session) {
				const blank = lucia.createBlankSessionCookie();
				cookieStore.set(blank.name, blank.value, blank.attributes);
			}
		} catch {
			// Next.js may forbid setting cookies during certain render phases.
		}

		return { user: result.user, session: result.session };
	},
);
