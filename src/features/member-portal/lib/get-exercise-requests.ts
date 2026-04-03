import { desc, eq } from "drizzle-orm";

import { db } from "@/server/db/client";
import { exerciseRequests, users } from "@/server/db/schema/gym-schema";

export type ExerciseRequestRow = {
	id: string;
	message: string;
	createdAt: Date;
	username: string;
	userId: string;
};

export type ExerciseRequestsQueryResult = {
	requests: ExerciseRequestRow[];
	missingTable: boolean;
};

export type ExerciseRequestAdminRow = ExerciseRequestRow & {
	email: string;
};

export type ExerciseRequestsAdminQueryResult = {
	requests: ExerciseRequestAdminRow[];
	missingTable: boolean;
};

function isMissingExerciseRequestsTableError(err: unknown): boolean {
	let cur: unknown = err;
	for (let i = 0; i < 5 && cur != null; i++) {
		if (typeof cur === "object" && cur !== null && "code" in cur) {
			const code = (cur as { code?: string }).code;
			if (code === "42P01") {
				return true;
			}
		}
		cur =
			typeof cur === "object" && cur !== null && "cause" in cur
				? (cur as { cause?: unknown }).cause
				: undefined;
	}
	const msg = err instanceof Error ? err.message : String(err);
	return (
		/relation\s+"exercise_requests"\s+does\s+not\s+exist/i.test(msg) ||
		(msg.includes("exercise_requests") && msg.includes("does not exist"))
	);
}

export async function getExerciseRequestsForCommunity(): Promise<ExerciseRequestsQueryResult> {
	try {
		const rows = await db
			.select({
				id: exerciseRequests.id,
				message: exerciseRequests.message,
				createdAt: exerciseRequests.createdAt,
				userId: exerciseRequests.userId,
				username: users.username,
			})
			.from(exerciseRequests)
			.innerJoin(users, eq(exerciseRequests.userId, users.id))
			.orderBy(desc(exerciseRequests.createdAt))
			.limit(50);
		return { requests: rows, missingTable: false };
	} catch (err) {
		if (isMissingExerciseRequestsTableError(err)) {
			if (process.env.NODE_ENV === "development") {
				console.warn(
					"[getExerciseRequestsForCommunity] Tabla `exercise_requests` ausente. Ejecuta: npm run db:migrate",
				);
			}
			return { requests: [], missingTable: true };
		}
		throw err;
	}
}

export async function getExerciseRequestsForAdmin(): Promise<ExerciseRequestsAdminQueryResult> {
	try {
		const rows = await db
			.select({
				id: exerciseRequests.id,
				message: exerciseRequests.message,
				createdAt: exerciseRequests.createdAt,
				userId: exerciseRequests.userId,
				username: users.username,
				email: users.email,
			})
			.from(exerciseRequests)
			.innerJoin(users, eq(exerciseRequests.userId, users.id))
			.orderBy(desc(exerciseRequests.createdAt))
			.limit(200);
		return { requests: rows, missingTable: false };
	} catch (err) {
		if (isMissingExerciseRequestsTableError(err)) {
			if (process.env.NODE_ENV === "development") {
				console.warn(
					"[getExerciseRequestsForAdmin] Tabla `exercise_requests` ausente. Ejecuta: npm run db:migrate",
				);
			}
			return { requests: [], missingTable: true };
		}
		throw err;
	}
}
