import { asc, eq, inArray, isNotNull, isNull, or } from "drizzle-orm";

import { db } from "@/server/db/client";
import {
	exercises,
	members,
	routineExercises,
	routines,
} from "@/server/db/schema/gym-schema";
import type { Exercise, Routine } from "@/server/db/schema/gym-schema";

export async function getAllExercises(): Promise<Exercise[]> {
	return db.select().from(exercises).orderBy(exercises.name);
}

export type RoutineWithExerciseIds = Routine & {
	exerciseIds: string[];
	assignedToMemberName: string | null;
};

export type RoutineAssignmentMember = {
	userId: string;
	fullName: string;
	email: string;
};

export async function getMembersForRoutineAssignment(): Promise<
	RoutineAssignmentMember[]
> {
	const rows = await db
		.select({
			userId: members.userId,
			fullName: members.fullName,
			email: members.email,
		})
		.from(members)
		.where(isNotNull(members.userId))
		.orderBy(asc(members.fullName));

	return rows.map((m) => ({
		userId: m.userId as string,
		fullName: m.fullName,
		email: m.email,
	}));
}

async function memberNameByUserId(
	userIds: string[],
): Promise<Map<string, string>> {
	if (userIds.length === 0) {
		return new Map();
	}
	const rows = await db
		.select({
			userId: members.userId,
			fullName: members.fullName,
		})
		.from(members)
		.where(inArray(members.userId, userIds));
	const m = new Map<string, string>();
	for (const row of rows) {
		if (row.userId) {
			m.set(row.userId, row.fullName);
		}
	}
	return m;
}

function routineRowsToWithExerciseIds(
	allRoutines: Routine[],
	links: { routineId: string; exerciseId: string }[],
	nameByUserId: Map<string, string>,
): RoutineWithExerciseIds[] {
	const byRoutine = new Map<string, string[]>();
	for (const l of links) {
		const arr = byRoutine.get(l.routineId) ?? [];
		arr.push(l.exerciseId);
		byRoutine.set(l.routineId, arr);
	}

	return allRoutines.map((r) => ({
		...r,
		exerciseIds: byRoutine.get(r.id) ?? [],
		assignedToMemberName: r.assignedUserId
			? (nameByUserId.get(r.assignedUserId) ?? null)
			: null,
	}));
}

export async function getRoutinesWithExerciseIds(): Promise<
	RoutineWithExerciseIds[]
> {
	const allRoutines = await db
		.select()
		.from(routines)
		.orderBy(asc(routines.name));
	const links = await db
		.select()
		.from(routineExercises)
		.orderBy(asc(routineExercises.routineId), asc(routineExercises.sortOrder));

	const assigneeIds = [
		...new Set(
			allRoutines
				.map((r) => r.assignedUserId)
				.filter((id): id is string => id != null),
		),
	];
	const nameByUserId = await memberNameByUserId(assigneeIds);

	return routineRowsToWithExerciseIds(allRoutines, links, nameByUserId);
}

/** Rutinas generales (sin socio) + las asignadas al usuario conectado. */
export async function getRoutinesForMember(
	memberUserId: string,
): Promise<RoutineWithExerciseIds[]> {
	const allRoutines = await db
		.select()
		.from(routines)
		.where(
			or(
				isNull(routines.assignedUserId),
				eq(routines.assignedUserId, memberUserId),
			),
		)
		.orderBy(asc(routines.name));

	const links = await db
		.select()
		.from(routineExercises)
		.orderBy(asc(routineExercises.routineId), asc(routineExercises.sortOrder));

	const assigneeIds = [
		...new Set(
			allRoutines
				.map((r) => r.assignedUserId)
				.filter((id): id is string => id != null),
		),
	];
	const nameByUserId = await memberNameByUserId(assigneeIds);

	return routineRowsToWithExerciseIds(allRoutines, links, nameByUserId);
}
