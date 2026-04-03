"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { isAdminRole } from "@/lib/auth/roles";
import { validateRequest } from "@/lib/auth/validate-request";
import { db } from "@/server/db/client";
import { DATABASE_CONNECTION_ERROR } from "@/server/db/env";
import {
	exercises,
	routineExercises,
	routines,
} from "@/server/db/schema/gym-schema";
import type { Exercise } from "@/server/db/schema/gym-schema";
import { parseLottieJsonString } from "@/features/training/lib/parse-lottie-json";

const muscleGroupSchema = z.enum([
	"chest",
	"back",
	"legs",
	"shoulders",
	"arms",
	"core",
	"cardio",
	"fullbody",
] as [Exercise["muscleGroup"], ...Exercise["muscleGroup"][]]);

const exerciseUpsertSchema = z
	.object({
		name: z.string().trim().min(1, "Nombre requerido").max(255),
		description: z.string().default(""),
		muscleGroup: muscleGroupSchema,
		/** Cover image URL for member cards (HTTPS). */
		coverImageUrl: z.string().max(2000).default(""),
		/** Raw Lottie JSON string from Iconscout / LottieFiles (primary media). */
		lottieJson: z.string().max(500_000).default(""),
		/** Legacy / fallback embed URL when Lottie is not set. */
		videoUrl: z.string().max(2000).default(""),
		formTips: z.string().default(""),
	})
	.superRefine((data, ctx) => {
		const lottieTrim = data.lottieJson.trim();
		if (lottieTrim.length > 0 && parseLottieJsonString(data.lottieJson) === null) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message:
					"JSON de Lottie inválido (debe ser un objeto JSON con capas de animación).",
				path: ["lottieJson"],
			});
		}
		const lottieOk = parseLottieJsonString(data.lottieJson) !== null;
		const videoTrim = data.videoUrl.trim();
		if (!lottieOk && videoTrim.length === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message:
					"Pega JSON de Lottie válido o una URL de video (YouTube, Vimeo o https).",
				path: ["lottieJson"],
			});
		}
		if (videoTrim.length > 0) {
			try {
				new URL(videoTrim);
			} catch {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "URL de video inválida.",
					path: ["videoUrl"],
				});
			}
		}
		const coverTrim = data.coverImageUrl.trim();
		if (coverTrim.length > 0) {
			try {
				new URL(coverTrim);
			} catch {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "URL de portada inválida.",
					path: ["coverImageUrl"],
				});
			}
		}
	});

const exerciseIdSchema = z.object({
	exerciseId: z.string().uuid(),
});

const routineSchema = z.object({
	name: z.string().trim().min(1).max(255),
	description: z.string().default(""),
	level: z.enum(["beginner", "pro"]),
});

const routineIdSchema = z.object({
	routineId: z.string().uuid(),
});

const routineExercisesSchema = z.object({
	routineId: z.string().uuid(),
	exerciseIds: z.array(z.string().uuid()),
});

async function requireStaff(): Promise<
	{ ok: true } | { ok: false; error: string }
> {
	const { user } = await validateRequest();
	if (!user || !isAdminRole(user.role)) {
		return { ok: false, error: "No autorizado." };
	}
	return { ok: true };
}

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createExerciseAction(
	input: unknown,
): Promise<ActionResult> {
	const gate = await requireStaff();
	if (!gate.ok) {
		return { ok: false, error: gate.error };
	}
	const parsed = exerciseUpsertSchema.safeParse(input);
	if (!parsed.success) {
		const f = parsed.error.flatten().fieldErrors;
		const msg =
			f.name?.[0] ??
			f.lottieJson?.[0] ??
			f.videoUrl?.[0] ??
			f.coverImageUrl?.[0] ??
			f.muscleGroup?.[0] ??
			"Datos inválidos";
		return { ok: false, error: msg };
	}
	try {
		const lj = parsed.data.lottieJson.trim();
		const cover = parsed.data.coverImageUrl.trim();
		await db.insert(exercises).values({
			name: parsed.data.name,
			description: parsed.data.description,
			muscleGroup: parsed.data.muscleGroup,
			coverImageUrl: cover.length > 0 ? cover : null,
			lottieJson: lj.length > 0 ? lj : null,
			videoUrl: parsed.data.videoUrl.trim(),
			formTips: parsed.data.formTips,
		});
		revalidatePath("/dashboard/admin/training");
		revalidatePath("/dashboard/member/training");
		return { ok: true };
	} catch {
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}

export async function updateExerciseAction(
	input: unknown,
): Promise<ActionResult> {
	const gate = await requireStaff();
	if (!gate.ok) {
		return { ok: false, error: gate.error };
	}
	const schema = exerciseUpsertSchema.extend({
		exerciseId: z.string().uuid(),
	});
	const parsed = schema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "Datos inválidos" };
	}
	try {
		const { exerciseId, ...rest } = parsed.data;
		const lj = rest.lottieJson.trim();
		const cover = rest.coverImageUrl.trim();
		await db
			.update(exercises)
			.set({
				name: rest.name,
				description: rest.description,
				muscleGroup: rest.muscleGroup,
				coverImageUrl: cover.length > 0 ? cover : null,
				lottieJson: lj.length > 0 ? lj : null,
				videoUrl: rest.videoUrl.trim(),
				formTips: rest.formTips,
			})
			.where(eq(exercises.id, exerciseId));
		revalidatePath("/dashboard/admin/training");
		revalidatePath("/dashboard/member/training");
		return { ok: true };
	} catch {
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}

export async function deleteExerciseAction(input: unknown): Promise<ActionResult> {
	const gate = await requireStaff();
	if (!gate.ok) {
		return { ok: false, error: gate.error };
	}
	const parsed = exerciseIdSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "Solicitud inválida" };
	}
	try {
		await db.transaction(async (tx) => {
			await tx
				.delete(routineExercises)
				.where(eq(routineExercises.exerciseId, parsed.data.exerciseId));
			await tx.delete(exercises).where(eq(exercises.id, parsed.data.exerciseId));
		});
		revalidatePath("/dashboard/admin/training");
		revalidatePath("/dashboard/member/training");
		return { ok: true };
	} catch {
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}

export async function createRoutineAction(input: unknown): Promise<ActionResult> {
	const gate = await requireStaff();
	if (!gate.ok) {
		return { ok: false, error: gate.error };
	}
	const parsed = routineSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "Datos inválidos" };
	}
	try {
		await db.insert(routines).values({
			name: parsed.data.name,
			description: parsed.data.description,
			level: parsed.data.level,
		});
		revalidatePath("/dashboard/admin/training");
		revalidatePath("/dashboard/member/training");
		return { ok: true };
	} catch {
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}

export async function deleteRoutineAction(input: unknown): Promise<ActionResult> {
	const gate = await requireStaff();
	if (!gate.ok) {
		return { ok: false, error: gate.error };
	}
	const parsed = routineIdSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "Solicitud inválida" };
	}
	try {
		await db.delete(routines).where(eq(routines.id, parsed.data.routineId));
		revalidatePath("/dashboard/admin/training");
		revalidatePath("/dashboard/member/training");
		return { ok: true };
	} catch {
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}

export async function setRoutineExercisesAction(
	input: unknown,
): Promise<ActionResult> {
	const gate = await requireStaff();
	if (!gate.ok) {
		return { ok: false, error: gate.error };
	}
	const parsed = routineExercisesSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "Datos inválidos" };
	}
	const { routineId, exerciseIds } = parsed.data;
	try {
		await db.transaction(async (tx) => {
			await tx
				.delete(routineExercises)
				.where(eq(routineExercises.routineId, routineId));
			for (let i = 0; i < exerciseIds.length; i++) {
				await tx.insert(routineExercises).values({
					routineId,
					exerciseId: exerciseIds[i] as string,
					sortOrder: i,
				});
			}
		});
		revalidatePath("/dashboard/admin/training");
		revalidatePath("/dashboard/member/training");
		return { ok: true };
	} catch {
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}
