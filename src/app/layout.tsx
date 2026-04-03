import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

export const metadata: Metadata = {
	title: "GYM BROTHERS | Centro de control",
	description:
		"GYM BROTHERS — gestión de membresías, planes y cobros en un solo panel.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es-MX" className="dark">
			<body className="min-h-screen bg-slate-950">
				{children}
				<Toaster position="top-right" richColors closeButton />
			</body>
		</html>
	);
}
