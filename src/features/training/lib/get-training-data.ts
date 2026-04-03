import { asc } from "drizzle-orm";

import { db } from "@/server/db/client";
import {
	exercises,
	routineExercises,
	routines,
} from "@/server/db/schema/gym-schema";
import type { Exercise, Routine } from "@/server/db/schema/gym-schema";

export async function getAllExercises(): Promise<Exercise[]> {
	return db.select().from(exercises).orderBy(exercises.name);
}

export type RoutineWithExerciseIds = Routine & {
	exerciseIds: string[];
};

export async function getRoutinesWithExerciseIds(): Promise<
	RoutineWithExerciseIds[]
> {
	const allRoutines = await db.select().from(routines).orderBy(asc(routines.name));
	const links = await db
		.select()
		.from(routineExercises)
		.orderBy(asc(routineExercises.routineId), asc(routineExercises.sortOrder));

	const byRoutine = new Map<string, string[]>();
	for (const l of links) {
		const arr = byRoutine.get(l.routineId) ?? [];
		arr.push(l.exerciseId);
		byRoutine.set(l.routineId, arr);
	}

	return allRoutines.map((r) => ({
		...r,
		exerciseIds: byRoutine.get(r.id) ?? [],
	}));
}
