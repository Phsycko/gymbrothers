"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { lucia } from "@/lib/auth/auth";
import { validateRequest } from "@/lib/auth/validate-request";
import { isDatabaseConfigured } from "@/server/db/env";

/**
 * Ends the Lucia session and clears the session cookie.
 */
export async function logoutAction(): Promise<void> {
	const { session } = await validateRequest();
	if (session && isDatabaseConfigured()) {
		await lucia.invalidateSession(session.id);
	}
	const cookieStore = await cookies();
	const blank = lucia.createBlankSessionCookie();
	cookieStore.set(blank.name, blank.value, blank.attributes);
	redirect("/login");
}
