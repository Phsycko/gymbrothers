"use client";

import { motion } from "framer-motion";
import { Dumbbell, Loader2, Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAction } from "@/features/auth/actions/login-action";
import { cn } from "@/lib/utils";

const inputClass =
	"h-11 rounded-lg border border-white/10 bg-black pl-10 text-sm text-white placeholder:text-white/40 " +
	"focus-visible:border-[#E11D48] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E11D48] " +
	"disabled:opacity-50";

export function LoginForm(): React.ReactElement {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();

	function onSubmit(e: FormEvent<HTMLFormElement>): void {
		e.preventDefault();
		setError(null);
		const fd = new FormData(e.currentTarget);
		const username = fd.get("username")?.toString() ?? "";
		const password = fd.get("password")?.toString() ?? "";
		startTransition(() => {
			void (async () => {
				const result = await loginAction({ username, password });
				if (result.error) {
					setError(result.error);
					return;
				}
				const dest =
					result.data?.role === "member"
						? "/dashboard/member"
						: "/dashboard";
				router.push(dest);
				router.refresh();
			})();
		});
	}

	return (
		<div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
			<motion.div
				className="w-full max-w-[420px]"
				initial={{ opacity: 0, scale: 0.94 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
			>
				<div
					className={cn(
						"rounded-lg border border-white/10 bg-white/5 p-8 shadow-none backdrop-blur-xl",
					)}
				>
					<div className="mb-8 space-y-2">
						<div className="flex items-center gap-3">
							<Dumbbell
								className="h-8 w-8 shrink-0 text-[#E11D48]"
								strokeWidth={2.25}
								aria-hidden
							/>
							<h1 className="font-sans text-2xl font-bold tracking-tight sm:text-[1.75rem]">
								<span className="text-white">GYM </span>
								<span className="text-[#E11D48] drop-shadow-[0_0_12px_rgba(225,29,72,0.45)]">
									BROTHERS
								</span>
							</h1>
						</div>
						<p className="text-sm leading-relaxed text-white/55">
							Acceso al portal con tu usuario y contraseña.
						</p>
					</div>

					<form className="space-y-5" onSubmit={onSubmit}>
						<div className="space-y-2">
							<label
								className="text-xs font-semibold uppercase tracking-wider text-white/70"
								htmlFor="username"
							>
								Usuario
							</label>
							<div className="relative">
								<User
									className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#E11D48]/90"
									aria-hidden
								/>
								<Input
									id="username"
									name="username"
									type="text"
									autoComplete="username"
									required
									placeholder="tu_usuario"
									disabled={pending}
									className={inputClass}
								/>
							</div>
						</div>
						<div className="space-y-2">
							<label
								className="text-xs font-semibold uppercase tracking-wider text-white/70"
								htmlFor="password"
							>
								Contraseña
							</label>
							<div className="relative">
								<Lock
									className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#E11D48]/90"
									aria-hidden
								/>
								<Input
									id="password"
									name="password"
									type="password"
									autoComplete="current-password"
									required
									disabled={pending}
									className={inputClass}
								/>
							</div>
						</div>
						{error ? (
							<p className="text-sm font-medium text-[#E11D48]" role="alert">
								{error}
							</p>
						) : null}
						<Button
							type="submit"
							disabled={pending}
							className={cn(
								"h-12 w-full rounded-lg border-0 bg-red-600 text-xs font-extrabold uppercase tracking-[0.2em] text-white",
								"shadow-none transition-colors hover:bg-red-700",
								"hover:shadow-[0_0_20px_rgba(225,29,72,0.5)]",
								"focus-visible:ring-2 focus-visible:ring-[#E11D48] focus-visible:ring-offset-2 focus-visible:ring-offset-black",
							)}
						>
							{pending ? (
								<span className="flex items-center justify-center gap-2">
									<Loader2 className="h-4 w-4 animate-spin text-white" />
									Entrando…
								</span>
							) : (
								"Continuar"
							)}
						</Button>
					</form>
				</div>
			</motion.div>
		</div>
	);
}
