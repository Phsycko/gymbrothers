import path from "node:path";

import withPWAInit from "@ducanh2912/next-pwa";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// Ensure .env, .env.local, etc. are loaded for this process (helps dev servers pick up DATABASE_URL).
loadEnvConfig(process.cwd());

// PWA (service worker + install prompt) is OFF in `next dev` by default — browsers need a
// registered SW to offer “Install app”. Use `npm run build && npm start`, or set
// ENABLE_PWA_DEV=true when running dev to test install locally (can conflict with HMR).
const withPWA = withPWAInit({
	dest: "public",
	disable:
		process.env.NODE_ENV === "development" &&
		process.env.ENABLE_PWA_DEV !== "true",
	register: true,
	scope: "/",
	reloadOnOnline: true,
	workboxOptions: {
		disableDevLogs: true,
	},
});

// Dev: use a stable filesystem cache under `.next` instead of disabling cache entirely.
// `cache: false` often causes missing chunk / "__webpack_modules__ is not a function"
// after HMR (worse on Windows paths with spaces). Run `npm run clean` when chunks drift.
const nextConfig: NextConfig = {
	experimental: {
		optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
	},
	webpack: (config, { dev }) => {
		if (dev) {
			config.cache = {
				type: "filesystem",
				cacheDirectory: path.join(process.cwd(), ".next", "cache", "webpack"),
			};
		}
		return config;
	},
};

export default withPWA(nextConfig);
