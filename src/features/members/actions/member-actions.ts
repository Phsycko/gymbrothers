"use server";

import { randomUUID } from "node:crypto";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { hashPassword } from "@/lib/auth/password";
import {
	isValidUsernameFormat,
	sanitizeUsername,
} from "@/lib/auth/username";
import { isAdminRole } from "@/lib/auth/roles";
import { validateRequest } from "@/lib/auth/validate-request";
import { db } from "@/server/db/client";
import { DATABASE_CONNECTION_ERROR } from "@/server/db/env";
import { members, subscriptions, users } from "@/server/db/schema/gym-schema";

/** Auto-generated password for new member portal accounts (hashed at rest). */
const DEFAULT_MEMBER_PLAIN_PASSWORD = "12345678";

const createMemberSchema = z.object({
	fullName: z.string().trim().min(1, "Name is required").max(255),
	email: z.string().trim().email("Invalid email").max(320),
	phone: z.string().trim().max(32),
	username: z.string().trim().min(1, "Usuario requerido"),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;

export type CreateMemberResult =
	| { ok: true }
	| { ok: false; error: string; fieldErrors?: Record<string, string[]> };

async function requireStaff(): Promise<
	{ ok: true } | { ok: false; error: string }
> {
	const { user } = await validateRequest();
	if (!user || !isAdminRole(user.role)) {
		return { ok: false, error: "No autorizado." };
	}
	return { ok: true };
}

const updateMemberSchema = z.object({
	memberId: z.string().uuid(),
	fullName: z.string().trim().min(1, "Nombre requerido").max(255),
	email: z.string().trim().email("Correo inválido").max(320),
	phone: z.string().trim().max(32),
	status: z.enum(["active", "inactive", "past_due"]),
});

export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

export type UpdateMemberResult =
	| { ok: true }
	| { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updateMemberAction(
	input: unknown,
): Promise<UpdateMemberResult> {
	const gate = await requireStaff();
	if (!gate.ok) {
		return { ok: false, error: gate.error };
	}

	const parsed = updateMemberSchema.safeParse(input);
	if (!parsed.success) {
		const flat = parsed.error.flatten();
		return {
			ok: false,
			error: "Datos inválidos",
			fieldErrors: flat.fieldErrors as Record<string, string[]>,
		};
	}

	const { memberId, fullName, email, phone, status } = parsed.data;

	try {
		const [existing] = await db
			.select({
				id: members.id,
				userId: members.userId,
			})
			.from(members)
			.where(eq(members.id, memberId))
			.limit(1);
		if (!existing) {
			return { ok: false, error: "Socio no encontrado." };
		}

		const dup = await db
			.select({ id: members.id })
			.from(members)
			.where(and(eq(members.email, email), ne(members.id, memberId)))
			.limit(1);
		if (dup.length > 0) {
			return { ok: false, error: "Ya existe otro socio con este correo." };
		}

		if (existing.userId) {
			const dupUser = await db
				.select({ id: users.id })
				.from(users)
				.where(and(eq(users.email, email), ne(users.id, existing.userId)))
				.limit(1);
			if (dupUser.length > 0) {
				return {
					ok: false,
					error: "Ese correo ya está en uso por otra cuenta.",
				};
			}
			await db
				.update(users)
				.set({ email })
				.where(eq(users.id, existing.userId));
		}

		await db
			.update(members)
			.set({ fullName, email, phone, status })
			.where(eq(members.id, memberId));

		revalidatePath("/dashboard/members");
		revalidatePath("/dashboard/member");
		return { ok: true };
	} catch {
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}

const deleteMemberSchema = z.object({
	memberId: z.string().uuid(),
});

export type DeleteMemberResult = { ok: true } | { ok: false; error: string };

/**
 * Elimina suscripciones (pagos en cascada), el socio y su cuenta de acceso si existe.
 */
export async function deleteMemberAction(
	input: unknown,
): Promise<DeleteMemberResult> {
	const gate = await requireStaff();
	if (!gate.ok) {
		return { ok: false, error: gate.error };
	}

	const parsed = deleteMemberSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "Solicitud inválida." };
	}

	const { memberId } = parsed.data;

	try {
		await db.transaction(async (tx) => {
			const [row] = await tx
				.select({ id: members.id, userId: members.userId })
				.from(members)
				.where(eq(members.id, memberId))
				.limit(1);
			if (!row) {
				throw new Error("MEMBER_NOT_FOUND");
			}
			await tx
				.delete(subscriptions)
				.where(eq(subscriptions.memberId, memberId));
			await tx.delete(members).where(eq(members.id, memberId));
			if (row.userId) {
				await tx.delete(users).where(eq(users.id, row.userId));
			}
		});

		revalidatePath("/dashboard/members");
		revalidatePath("/dashboard/payments");
		revalidatePath("/dashboard/member");
		return { ok: true };
	} catch (err) {
		if (err instanceof Error && err.message === "MEMBER_NOT_FOUND") {
			return { ok: false, error: "Socio no encontrado." };
		}
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}

/**
 * Crea cuenta de usuario (contraseña por defecto hasheada) + registro de socio en una transacción.
 */
export async function createMemberAction(
	input: unknown,
): Promise<CreateMemberResult> {
	const gate = await requireStaff();
	if (!gate.ok) {
		return { ok: false, error: gate.error };
	}

	const parsed = createMemberSchema.safeParse(input);
	if (!parsed.success) {
		const flat = parsed.error.flatten();
		return {
			ok: false,
			error: "Validation failed",
			fieldErrors: flat.fieldErrors as Record<string, string[]>,
		};
	}

	const { fullName, email, phone } = parsed.data;
	const username = sanitizeUsername(parsed.data.username);
	if (!isValidUsernameFormat(username)) {
		return {
			ok: false,
			error: "Usuario inválido",
			fieldErrors: {
				username: [
					"3–64 caracteres: letras minúsculas, números, . _ - (sin espacios)",
				],
			},
		};
	}

	const emailNorm = email.trim().toLowerCase();
	const qrIdentifier = randomUUID();
	const hashedPassword = await hashPassword(DEFAULT_MEMBER_PLAIN_PASSWORD);

	try {
		const dupMember = await db
			.select({ id: members.id })
			.from(members)
			.where(eq(members.email, emailNorm))
			.limit(1);
		if (dupMember.length > 0) {
			return {
				ok: false,
				error: "Ya existe un socio con este correo.",
			};
		}

		const dupEmailUser = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, emailNorm))
			.limit(1);
		if (dupEmailUser.length > 0) {
			return {
				ok: false,
				error: "Ese correo ya tiene una cuenta de acceso.",
			};
		}

		const dupUser = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.username, username))
			.limit(1);
		if (dupUser.length > 0) {
			return {
				ok: false,
				error: "Ese nombre de usuario ya está en uso.",
				fieldErrors: { username: ["Elige otro usuario"] },
			};
		}

		await db.transaction(async (tx) => {
			const [u] = await tx
				.insert(users)
				.values({
					username,
					email: emailNorm,
					hashedPassword,
					passwordIsDefault: true,
					role: "member",
				})
				.returning({ id: users.id });

			if (!u) {
				throw new Error("USER_INSERT_FAILED");
			}

			await tx.insert(members).values({
				userId: u.id,
				fullName,
				email: emailNorm,
				phone,
				qrIdentifier,
				status: "active",
			});
		});

		revalidatePath("/dashboard/members");
		revalidatePath("/dashboard/member");
		return { ok: true };
	} catch (err) {
		if (err instanceof Error && err.message === "USER_INSERT_FAILED") {
			return { ok: false, error: "No se pudo crear la cuenta." };
		}
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}
