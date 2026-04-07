/**
 * RBAC helpers for dashboard shells and route guards.
 * Admin = staff operations; member = brother portal only.
 */
export function isMemberRole(role: string): boolean {
	return role === "member";
}

export function isAdminRole(role: string): boolean {
	return role === "owner" || role === "staff";
}
