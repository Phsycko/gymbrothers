/** Allowed: lowercase letters, digits, `.`, `_`, `-` (spaces stripped). */
const USERNAME_PATTERN = /^[a-z0-9._-]{3,64}$/;

/**
 * Trims, lowercases, and removes whitespace. Does not strip invalid characters —
 * validate with {@link isValidUsernameFormat} after sanitizing.
 */
export function sanitizeUsername(raw: string): string {
	return raw.trim().toLowerCase().replace(/\s+/g, "");
}

export function isValidUsernameFormat(username: string): boolean {
	return USERNAME_PATTERN.test(username);
}
