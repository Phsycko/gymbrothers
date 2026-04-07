import * as argon2 from "argon2";

/**
 * Produces a PHC-format Argon2id hash suitable for storage in `users.hashed_password`.
 * Uses 64 MiB memory, 3 iterations, 4 lanes (OWASP-aligned modern defaults).
 */
export async function hashPassword(plain: string): Promise<string> {
	return argon2.hash(plain, {
		type: argon2.argon2id,
		memoryCost: 65536,
		timeCost: 3,
		parallelism: 4,
	});
}

/**
 * Verifies a password against a stored Argon2id hash.
 */
export async function verifyPassword(
	storedHash: string,
	plain: string,
): Promise<boolean> {
	try {
		return await argon2.verify(storedHash, plain);
	} catch {
		return false;
	}
}
