import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia, TimeSpan } from "lucia";

import { db } from "@/server/db/client";
import { sessions } from "@/server/db/schema/auth-schema";
import { users } from "@/server/db/schema/gym-schema";

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

/**
 * Columns persisted on `users` (excluding `id`) passed through the adapter before mapping.
 */
interface DatabaseUserAttributes {
	username: string;
	email: string;
	hashedPassword: string;
	passwordIsDefault: boolean;
	role: "owner" | "staff" | "member";
	createdAt: Date;
	updatedAt: Date;
}

export const lucia = new Lucia(adapter, {
	sessionExpiresIn: new TimeSpan(30, "d"),
	sessionCookie: {
		expires: false,
		// httpOnly is always true on Lucia session cookies (see lucia CookieController).
		attributes: {
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			path: "/",
		},
	},
	getUserAttributes: (attributes) => ({
		username: attributes.username,
		email: attributes.email,
		role: attributes.role,
		passwordIsDefault: attributes.passwordIsDefault,
	}),
});

export type { Session, User } from "lucia";

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}
