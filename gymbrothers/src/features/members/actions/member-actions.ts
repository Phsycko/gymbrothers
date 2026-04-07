"use server";

import { randomUUID } from "node:crypto";

import { parseISO, startOfDay } from "date-fns";
import { and, desc, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { selectActivePlanById } from "@/features/plans/lib/plan-db-compat";
import { computeSubscriptionEndDate } from "@/features/plans/lib/plan-duration";
import { hashPassword } from "@/lib/auth/password";
import { isAdminRole } from "@/lib/auth/roles";
import { isValidUsernameFormat, sanitizeUsername } from "@/lib/auth/username";
import { validateRequest } from "@/lib/auth/validate-request";
import { db } from "@/server/db/client";
import { DATABASE_CONNECTION_ERROR } from "@/server/db/env";
import {
	members,
	payments,
	subscriptions,
	users,
} from "@/server/db/schema/gym-schema";

/** Auto-generated password for new member portal accounts (hashed at rest). */
const DEFAULT_MEMBER_PLAIN_PASSWORD = "12345678";

const createMemberSchema = z.object({
	fullName: z.string().trim().min(1, "Name is required").max(255),
	username: z.string().trim().min(1, "Usuario requerido"),
	planId: z.string().uuid("Elige un plan"),
	startDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (AAAA-MM-DD)"),
});

/** Correo técnico único derivado del usuario (el alta solo pide nombre + usuario). */
function syntheticMemberEmail(username: string): string {
	return `${username}@member.gymbrothers.local`;
}

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
	planId: z.string().uuid("Elige un plan"),
	startDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (AAAA-MM-DD)"),
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

	const {
		memberId,
		fullName,
		email,
		phone,
		status,
		planId,
		startDate: startDateRaw,
	} = parsed.data;

	const startDateParsed = startOfDay(parseISO(startDateRaw));
	if (Number.isNaN(startDateParsed.getTime())) {
		return {
			ok: false,
			error: "Fecha de inicio inválida.",
			fieldErrors: { startDate: ["Elige una fecha válida"] },
		};
	}

	let plan: NonNullable<Awaited<ReturnType<typeof selectActivePlanById>>>;
	try {
		const row = await selectActivePlanById(planId);
		if (!row) {
			return {
				ok: false,
				error: "El plan seleccionado no está disponible.",
				fieldErrors: { planId: ["Elige otro plan"] },
			};
		}
		plan = row;
	} catch {
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}

	const endDate = computeSubscriptionEndDate(startDateParsed, plan);

	try {
		await db.transaction(async (tx) => {
			const [existing] = await tx
				.select({
					id: members.id,
					userId: members.userId,
				})
				.from(members)
				.where(eq(members.id, memberId))
				.limit(1);
			if (!existing) {
				throw new Error("MEMBER_NOT_FOUND");
			}

			const dup = await tx
				.select({ id: members.id })
				.from(members)
				.where(and(eq(members.email, email), ne(members.id, memberId)))
				.limit(1);
			if (dup.length > 0) {
				throw new Error("DUPLICATE_EMAIL");
			}

			if (existing.userId) {
				const dupUser = await tx
					.select({ id: users.id })
					.from(users)
					.where(and(eq(users.email, email), ne(users.id, existing.userId)))
					.limit(1);
				if (dupUser.length > 0) {
					throw new Error("DUPLICATE_USER_EMAIL");
				}
				await tx
					.update(users)
					.set({ email })
					.where(eq(users.id, existing.userId));
			}

			await tx
				.update(members)
				.set({ fullName, email, phone, status })
				.where(eq(members.id, memberId));

			const [latestSub] = await tx
				.select()
				.from(subscriptions)
				.where(eq(subscriptions.memberId, memberId))
				.orderBy(desc(subscriptions.endDate))
				.limit(1);

			if (latestSub) {
				await tx
					.update(subscriptions)
					.set({
						planId: plan.id,
						startDate: startDateParsed,
						endDate,
					})
					.where(eq(subscriptions.id, latestSub.id));
			} else {
				const [sub] = await tx
					.insert(subscriptions)
					.values({
						memberId,
						planId: plan.id,
						startDate: startDateParsed,
						endDate,
						autoRenew: false,
					})
					.returning({ id: subscriptions.id });

				if (!sub) {
					throw new Error("SUBSCRIPTION_INSERT_FAILED");
				}

				await tx.insert(payments).values({
					subscriptionId: sub.id,
					amountCents: plan.priceCents,
					status: "completed",
					providerRef: "manual:member_edit",
				});
			}
		});

		revalidatePath("/dashboard/members");
		revalidatePath("/dashboard/member");
		revalidatePath("/dashboard/payments");
		return { ok: true };
	} catch (err) {
		if (err instanceof Error) {
			if (err.message === "MEMBER_NOT_FOUND") {
				return { ok: false, error: "Socio no encontrado." };
			}
			if (err.message === "DUPLICATE_EMAIL") {
				return { ok: false, error: "Ya existe otro socio con este correo." };
			}
			if (err.message === "DUPLICATE_USER_EMAIL") {
				return {
					ok: false,
					error: "Ese correo ya está en uso por otra cuenta.",
				};
			}
			if (err.message === "SUBSCRIPTION_INSERT_FAILED") {
				return { ok: false, error: "No se pudo crear la suscripción." };
			}
		}
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

	const { fullName, planId, startDate: startDateRaw } = parsed.data;
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

	const emailNorm = syntheticMemberEmail(username);
	const phone = "";
	const qrIdentifier = randomUUID();
	const hashedPassword = await hashPassword(DEFAULT_MEMBER_PLAIN_PASSWORD);

	const startDateParsed = startOfDay(parseISO(startDateRaw));
	if (Number.isNaN(startDateParsed.getTime())) {
		return {
			ok: false,
			error: "Fecha de inicio inválida.",
			fieldErrors: { startDate: ["Elige una fecha válida"] },
		};
	}

	let plan: NonNullable<Awaited<ReturnType<typeof selectActivePlanById>>>;
	try {
		const row = await selectActivePlanById(planId);
		if (!row) {
			return {
				ok: false,
				error: "El plan seleccionado no está disponible.",
				fieldErrors: { planId: ["Elige otro plan"] },
			};
		}
		plan = row;
	} catch {
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}

	const endDate = computeSubscriptionEndDate(startDateParsed, plan);

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

			const [m] = await tx
				.insert(members)
				.values({
					userId: u.id,
					fullName,
					email: emailNorm,
					phone,
					qrIdentifier,
					status: "active",
				})
				.returning({ id: members.id });

			if (!m) {
				throw new Error("MEMBER_INSERT_FAILED");
			}

			const [sub] = await tx
				.insert(subscriptions)
				.values({
					memberId: m.id,
					planId: plan.id,
					startDate: startDateParsed,
					endDate,
					autoRenew: false,
				})
				.returning({ id: subscriptions.id });

			if (!sub) {
				throw new Error("SUBSCRIPTION_INSERT_FAILED");
			}

			await tx.insert(payments).values({
				subscriptionId: sub.id,
				amountCents: plan.priceCents,
				status: "completed",
				providerRef: "manual:member_signup",
			});
		});

		revalidatePath("/dashboard/members");
		revalidatePath("/dashboard/member");
		revalidatePath("/dashboard/payments");
		return { ok: true };
	} catch (err) {
		if (err instanceof Error && err.message === "USER_INSERT_FAILED") {
			return { ok: false, error: "No se pudo crear la cuenta." };
		}
		if (err instanceof Error && err.message === "MEMBER_INSERT_FAILED") {
			return { ok: false, error: "No se pudo registrar el socio." };
		}
		if (err instanceof Error && err.message === "SUBSCRIPTION_INSERT_FAILED") {
			return { ok: false, error: "No se pudo crear la suscripción." };
		}
		return { ok: false, error: DATABASE_CONNECTION_ERROR };
	}
}
