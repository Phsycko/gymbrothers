const mxn = new Intl.NumberFormat("es-MX", {
	style: "currency",
	currency: "MXN",
});

/**
 * Formats integer centavos as Mexican pesos (MXN).
 */
export function formatMxnFromCents(cents: number): string {
	return mxn.format(cents / 100);
}

/** Eje Y del gráfico — versión compacta (miles / millones). */
export function formatMxnCompactFromCents(cents: number): string {
	const n = cents / 100;
	if (n >= 1_000_000) {
		return `${(n / 1_000_000).toFixed(1)}M`;
	}
	if (n >= 1000) {
		return `${(n / 1000).toFixed(1)}k`;
	}
	return formatMxnFromCents(cents);
}
