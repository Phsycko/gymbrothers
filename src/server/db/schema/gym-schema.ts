import {
	boolean,
	date,
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["owner", "staff", "member"]);

export const memberStatusEnum = pgEnum("member_status", [
	"active",
	"inactive",
	"past_due",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
	"pending",
	"completed",
	"failed",
	"refunded",
]);

export const announcementPriorityEnum = pgEnum("announcement_priority", [
	"low",
	"medium",
	"high",
]);

export const announcementCategoryEnum = pgEnum("announcement_category", [
	"event",
	"maintenance",
	"promotion",
]);

/** Filter / display grouping for exercise library (icons, Netflix-style rows). */
export const muscleGroupEnum = pgEnum("muscle_group", [
	"chest",
	"back",
	"legs",
	"shoulders",
	"arms",
	"core",
	"cardio",
	"fullbody",
]);

export const routineLevelEnum = pgEnum("routine_level", ["beginner", "pro"]);

export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),
	username: varchar("username", { length: 64 }).notNull().unique(),
	email: varchar("email", { length: 320 }).notNull().unique(),
	hashedPassword: varchar("hashed_password", { length: 255 }).notNull(),
	/** True when the account still uses the auto-generated member password (e.g. 12345678). */
	passwordIsDefault: boolean("password_is_default").notNull().default(false),
	role: userRoleEnum("role").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
});

export const members = pgTable(
	"members",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		/** Login account for this member, when provisioned from admin. */
		userId: uuid("user_id")
			.references(() => users.id, { onDelete: "set null" })
			.unique(),
		fullName: varchar("full_name", { length: 255 }).notNull(),
		email: varchar("email", { length: 320 }).notNull(),
		phone: varchar("phone", { length: 32 }).notNull().default(""),
		qrIdentifier: varchar("qr_identifier", { length: 128 }).notNull(),
		status: memberStatusEnum("status").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("members_qr_identifier_idx").on(table.qrIdentifier),
		index("members_email_idx").on(table.email),
		index("members_user_id_idx").on(table.userId),
	],
);

export const plans = pgTable("plans", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
	description: text("description").notNull().default(""),
	priceCents: integer("price_cents").notNull(),
	durationMonths: integer("duration_months").notNull(),
	/** When set (e.g. 1), subscription length uses weeks; otherwise {@link durationMonths}. */
	durationWeeks: integer("duration_weeks"),
	active: boolean("active").notNull().default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
});

export const subscriptions = pgTable(
	"subscriptions",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		memberId: uuid("member_id")
			.notNull()
			.references(() => members.id, { onDelete: "restrict" }),
		planId: uuid("plan_id")
			.notNull()
			.references(() => plans.id, { onDelete: "restrict" }),
		startDate: date("start_date", { mode: "date" }).notNull(),
		endDate: date("end_date", { mode: "date" }).notNull(),
		autoRenew: boolean("auto_renew").notNull().default(false),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("subscriptions_member_id_idx").on(table.memberId),
		index("subscriptions_plan_id_idx").on(table.planId),
		index("subscriptions_end_date_idx").on(table.endDate),
	],
);

export const payments = pgTable(
	"payments",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		subscriptionId: uuid("subscription_id")
			.notNull()
			.references(() => subscriptions.id, { onDelete: "cascade" }),
		amountCents: integer("amount_cents").notNull(),
		status: paymentStatusEnum("status").notNull(),
		providerRef: varchar("provider_ref", { length: 512 }).notNull().default(""),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(table) => [index("payments_subscription_id_idx").on(table.subscriptionId)],
);

export const announcements = pgTable(
	"announcements",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		title: varchar("title", { length: 255 }).notNull(),
		content: text("content").notNull(),
		priority: announcementPriorityEnum("priority").notNull(),
		category: announcementCategoryEnum("category").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
			.defaultNow()
			.notNull(),
	},
	(table) => [index("announcements_created_at_idx").on(table.createdAt)],
);

/** Member-submitted ideas for exercises to add to the library (Comunidad tab). */
export const exerciseRequests = pgTable(
	"exercise_requests",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		message: text("message").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("exercise_requests_created_at_idx").on(table.createdAt),
		index("exercise_requests_user_id_idx").on(table.userId),
	],
);

export const exercises = pgTable(
	"exercises",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		name: varchar("name", { length: 255 }).notNull(),
		description: text("description").notNull().default(""),
		/** Primary taxonomy: chest, back, legs, etc. */
		muscleGroup: muscleGroupEnum("muscle_group").notNull(),
		/** Cover image URL for member library cards (muscle map / thumbnail). */
		coverImageUrl: text("cover_image_url"),
		/** Lottie JSON (Iconscout / LottieFiles). Primary media for member cards when set. */
		lottieJson: text("lottie_json"),
		/** YouTube / embed URL — opened in modal, not on the card. */
		videoUrl: text("video_url").notNull().default(""),
		/** Execution notes + "Tips de los Brothers" (admin). */
		formTips: text("form_tips").notNull().default(""),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(table) => [index("exercises_muscle_group_idx").on(table.muscleGroup)],
);

export const routines = pgTable(
	"routines",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		name: varchar("name", { length: 255 }).notNull(),
		description: text("description").notNull().default(""),
		level: routineLevelEnum("level").notNull(),
		/** When set, only this login user sees the routine in the member app; when null, all members see it. */
		assignedUserId: uuid("assigned_user_id").references(() => users.id, {
			onDelete: "set null",
		}),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(table) => [index("routines_assigned_user_id_idx").on(table.assignedUserId)],
);

export const routineExercises = pgTable(
	"routine_exercises",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		routineId: uuid("routine_id")
			.notNull()
			.references(() => routines.id, { onDelete: "cascade" }),
		exerciseId: uuid("exercise_id")
			.notNull()
			.references(() => exercises.id, { onDelete: "restrict" }),
		sortOrder: integer("sort_order").notNull().default(0),
	},
	(table) => [
		index("routine_exercises_routine_id_idx").on(table.routineId),
		index("routine_exercises_exercise_id_idx").on(table.exerciseId),
	],
);

export type Member = typeof members.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type ExerciseRequest = typeof exerciseRequests.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type Routine = typeof routines.$inferSelect;
export type RoutineExercise = typeof routineExercises.$inferSelect;
