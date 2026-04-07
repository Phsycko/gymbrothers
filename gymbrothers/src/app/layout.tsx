import type { Metadata, Viewport } from "next";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
	themeColor: "#E11D48",
	colorScheme: "dark",
};

export const metadata: Metadata = {
	title: "GYM BROTHERS | Centro de control",
	description:
		"GYM BROTHERS — gestión de membresías, planes y cobros en un solo panel.",
	applicationName: "GYM BROTHERS",
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: "GYM BROTHERS",
	},
	formatDetection: {
		telephone: false,
	},
	icons: {
		icon: [
			{
				url: "/icons/icon-192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				url: "/icons/icon-512.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
		apple: [
			{
				url: "/icons/icon-192.png",
				sizes: "192x192",
				type: "image/png",
			},
		],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es-MX" className="dark">
			<body className="min-h-screen min-w-0 overflow-x-hidden bg-slate-950 antialiased">
				{children}
				<Toaster
					position="top-center"
					richColors
					closeButton
					offset="max(0.75rem, env(safe-area-inset-top, 0px))"
					mobileOffset="max(0.75rem, env(safe-area-inset-top, 0px))"
					toastOptions={{
						classNames: {
							toast:
								"max-w-[min(100vw-1.5rem,24rem)] text-[15px] leading-snug sm:max-w-sm sm:text-sm",
						},
					}}
				/>
			</body>
		</html>
	);
}
