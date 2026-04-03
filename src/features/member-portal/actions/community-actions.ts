"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { validateRequest } from "@/lib/auth/validate-request";
import { db } from "@/server/db/client";
import { DATABASE_CONNECTION_ERROR } from "@/server/db/env";
import { exerciseRequests } from "@/server/db/schema/gym-schema";

const requestSchema = z.object({
	message: z
		.string()
		.trim()
		.min(3, "Escribe al menos 3 caracteres.")
		.max(500, "Máximo 500 caracteres."),
});

export type SubmitExerciseRequestResult =
	| { ok: true }
	| { ok: false; error: string };

export async function submitExerciseRequestAction(
	input: unknown,
): Promise<SubmitExerciseRequestResult> {
	const { user } = await validateRequest();
	if (!user || user.role !== "member") {
		return { ok: false, error: "Debes iniciar sesión como miembro." };
	}

	const parsed = requestSchema.safeParse(input);
	if (!parsed.success) {
		const msg =
			parsed.error.flatten().fieldErrors.message?.[0] ?? "Datos inválidos";
		return { ok: false, error: msg };
	}

	try {
		await db.insert(exerciseRequests).values({
			userId: user.id,
			message: parsed.data.message,
		});
		revalidatePath("/dashboard/member/community");
		return { ok: true };
	} catch {
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}
