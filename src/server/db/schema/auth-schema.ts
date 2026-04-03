import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./gym-schema";

/**
 * Lucia session storage (database-backed sessions, linked to {@link users}).
 */
export const sessions = pgTable(
	"sessions",
	{
		id: text("id").primaryKey(),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		expiresAt: timestamp("expires_at", {
			withTimezone: true,
			mode: "date",
		}).notNull(),
	},
	(table) => [
		index("sessions_user_id_idx").on(table.userId),
		index("sessions_expires_at_idx").on(table.expiresAt),
	],
);
