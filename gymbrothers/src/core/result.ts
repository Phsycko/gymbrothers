/**
 * Standard command result for server actions and services.
 */
export interface Result<T> {
	data: T | null;
	error: string | null;
}
