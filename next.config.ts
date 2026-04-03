import path from "node:path";

import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// Ensure .env, .env.local, etc. are loaded for this process (helps dev servers pick up DATABASE_URL).
loadEnvConfig(process.cwd());

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

export default nextConfig;
