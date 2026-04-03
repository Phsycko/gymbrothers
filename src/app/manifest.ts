import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "GYM BROTHERS",
		short_name: "GYM BROTHERS",
		description:
			"GYM BROTHERS — gestión de membresías, planes y cobros en un solo panel.",
		start_url: "/",
		scope: "/",
		display: "standalone",
		background_color: "#020617",
		theme_color: "#E11D48",
		orientation: "portrait-primary",
		lang: "es-MX",
		icons: [
			{
				src: "/icons/icon-192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/icons/icon-512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
	};
}
