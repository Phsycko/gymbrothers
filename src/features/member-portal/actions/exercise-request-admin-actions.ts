"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { isAdminRole } from "@/lib/auth/roles";
import { validateRequest } from "@/lib/auth/validate-request";
import { db } from "@/server/db/client";
import { DATABASE_CONNECTION_ERROR } from "@/server/db/env";
import { exerciseRequests } from "@/server/db/schema/gym-schema";

export type ExerciseRequestAdminActionResult =
	| { ok: true }
	| { ok: false; error: string };

async function requireStaff(): Promise<
	{ ok: true } | { ok: false; error: string }
> {
	const { user } = await validateRequest();
	if (!user || !isAdminRole(user.role)) {
		return { ok: false, error: "No autorizado." };
	}
	return { ok: true };
}

const deleteSchema = z.object({
	requestId: z.string().uuid(),
});

export async function deleteExerciseRequestAdminAction(
	input: unknown,
): Promise<ExerciseRequestAdminActionResult> {
	const gate = await requireStaff();
	if (!gate.ok) {
		return { ok: false, error: gate.error };
	}
	const parsed = deleteSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "Solicitud inválida." };
	}
	try {
		await db
			.delete(exerciseRequests)
			.where(eq(exerciseRequests.id, parsed.data.requestId));
		revalidatePath("/dashboard/exercise-requests");
		revalidatePath("/dashboard/member/community");
		return { ok: true };
	} catch {
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}
