/**
 * Converts a user-entered money string (e.g. "99.00", "$1,250.50") to integer cents.
 * All persisted prices must use cents to avoid floating-point drift.
 */
export function parseMoneyToCents(
	raw: string,
): { ok: true; cents: number } | { ok: false; error: string } {
	const cleaned = raw.trim().replace(/[$,\s]/g, "");
	if (!cleaned) {
		return { ok: false, error: "Enter a price" };
	}
	const n = Number.parseFloat(cleaned);
	if (Number.isNaN(n) || n < 0) {
		return { ok: false, error: "Invalid amount" };
	}
	const cents = Math.round(n * 100);
	if (cents < 1) {
		return { ok: false, error: "Minimum is $0.01" };
	}
	if (cents > 99_999_999_99) {
		return { ok: false, error: "Amount too large" };
	}
	return { ok: true, cents };
}

/** Valor para inputs de precio al editar un plan (centavos → "0.00"). */
export function formatCentsToMoneyInput(cents: number): string {
	return (cents / 100).toFixed(2);
}
