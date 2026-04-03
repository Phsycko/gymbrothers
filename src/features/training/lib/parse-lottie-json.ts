/**
 * Validates and returns parsed Lottie JSON object, or null if invalid / empty.
 */
export function parseLottieJsonString(raw: string | null | undefined): object | null {
	if (raw == null || typeof raw !== "string") {
		return null;
	}
	const t = raw.trim();
	if (!t) {
		return null;
	}
	try {
		const data = JSON.parse(t) as unknown;
		if (
			data !== null &&
			typeof data === "object" &&
			"v" in data &&
			"layers" in data
		) {
			return data as object;
		}
		return null;
	} catch {
		return null;
	}
}
