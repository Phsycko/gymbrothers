"use client";

import { Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordAction } from "@/features/auth/actions/change-password-action";
import { cn } from "@/lib/utils";

const inputClass =
	"h-11 rounded-lg border border-white/10 bg-black pl-10 text-sm text-white placeholder:text-white/40 " +
	"focus-visible:border-[#E11D48] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E11D48]";

export function MemberSecurityForm({
	passwordIsDefault,
}: {
	passwordIsDefault: boolean;
}): React.ReactElement {
	const router = useRouter();
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [pending, setPending] = useState(false);

	async function onSubmit(e: React.FormEvent): Promise<void> {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			toast.error("Las contraseñas nuevas no coinciden.");
			return;
		}
		setPending(true);
		try {
			const result = await changePasswordAction({ currentPassword, newPassword });
			if (result.ok) {
				toast.success("Contraseña actualizada. Inicia sesión de nuevo.");
				router.push("/login");
				return;
			}
			toast.error("No se pudo cambiar la contraseña", {
				description: result.error,
			});
		} finally {
			setPending(false);
		}
	}

	return (
		<form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
			{passwordIsDefault ? (
				<div
					className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100"
					role="status"
				>
					Tu contraseña actual es la genérica. Por seguridad, cámbiala ahora.
				</div>
			) : null}

			<div className="space-y-2">
				<Label htmlFor="current-password" className="text-white/80">
					Contraseña actual
				</Label>
				<div className="relative">
					<Lock
						className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#E11D48]/90"
						aria-hidden
					/>
					<Input
						id="current-password"
						type="password"
						autoComplete="current-password"
						value={currentPassword}
						onChange={(e) => setCurrentPassword(e.target.value)}
						required
						disabled={pending}
						className={inputClass}
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="new-password" className="text-white/80">
					Nueva contraseña
				</Label>
				<div className="relative">
					<Lock
						className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#E11D48]/90"
						aria-hidden
					/>
					<Input
						id="new-password"
						type="password"
						autoComplete="new-password"
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						required
						minLength={8}
						disabled={pending}
						className={inputClass}
					/>
				</div>
				<p className="text-xs text-white/45">Mínimo 8 caracteres.</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="confirm-password" className="text-white/80">
					Confirmar nueva contraseña
				</Label>
				<div className="relative">
					<Lock
						className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#E11D48]/90"
						aria-hidden
					/>
					<Input
						id="confirm-password"
						type="password"
						autoComplete="new-password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
						minLength={8}
						disabled={pending}
						className={inputClass}
					/>
				</div>
			</div>

			<Button
				type="submit"
				disabled={pending}
				className={cn(
					"h-12 w-full rounded-lg border-0 bg-[#E11D48] text-xs font-extrabold uppercase tracking-[0.15em] text-white",
					"hover:bg-red-700 hover:shadow-[0_0_24px_rgba(225,29,72,0.45)]",
				)}
			>
				{pending ? (
					<span className="flex items-center justify-center gap-2">
						<Loader2 className="h-4 w-4 animate-spin" />
						Guardando…
					</span>
				) : (
					"Actualizar contraseña"
				)}
			</Button>
		</form>
	);
}
