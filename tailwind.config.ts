import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
	darkMode: ["class"],
	content: ["./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			keyframes: {
				"auth-glow-pulse": {
					"0%, 100%": { opacity: "0.42", transform: "scale(1)" },
					"50%": { opacity: "0.88", transform: "scale(1.04)" },
				},
				"auth-glow-flicker": {
					"0%, 100%": { opacity: "0.18" },
					"8%": { opacity: "0.55" },
					"12%": { opacity: "0.22" },
					"20%": { opacity: "0.62" },
					"24%": { opacity: "0.28" },
					"35%": { opacity: "0.5" },
					"50%": { opacity: "0.75" },
					"55%": { opacity: "0.3" },
					"72%": { opacity: "0.58" },
					"88%": { opacity: "0.25" },
				},
			},
			animation: {
				"auth-glow-pulse": "auth-glow-pulse 3.2s ease-in-out infinite",
				"auth-glow-flicker": "auth-glow-flicker 2.6s linear infinite",
			},
		},
	},
	plugins: [tailwindcssAnimate],
};

export default config;
