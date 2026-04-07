"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeUsernameAction } from "@/features/member-portal/actions/change-username-action";
import { cn } from "@/lib/utils";

const inputClass =
	"h-11 rounded-lg border border-white/10 bg-black px-3 font-mono text-sm text-white placeholder:text-white/40 " +
	"focus-visible:border-[#E11D48] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E11D48]";

export function MemberUsernameForm({
	initialUsername,
	embedded = false,
}: {
	initialUsername: string;
	/** En perfil: sin etiqueta duplicada y botón al lado del campo. */
	embedded?: boolean;
}): React.ReactElement {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [value, setValue] = useState(initialUsername);

	function onSubmit(e: React.FormEvent): void {
		e.preventDefault();
		startTransition(() => {
			void (async () => {
				const r = await changeUsernameAction({ username: value });
				if (r.ok) {
					toast.success("Usuario actualizado");
					router.refresh();
					return;
				}
				toast.error(r.error);
			})();
		});
	}

	const dirty = value.trim() !== initialUsername;

	const submitButton = (
		<Button
			type="submit"
			disabled={pending || !dirty}
			className={cn(
				"bg-[#E11D48] text-white hover:bg-[#BE123C]",
				embedded && "shrink-0 sm:w-auto",
			)}
		>
			{pending ? (
				<>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
					Guardando…
				</>
			) : embedded ? (
				"Guardar"
			) : (
				"Guardar cambios"
			)}
		</Button>
	);

	if (embedded) {
		return (
			<form onSubmit={onSubmit} className="space-y-2">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
					<Input
						id="member-username"
						name="username"
						autoComplete="username"
						value={value}
						onChange={(e) => setValue(e.target.value)}
						disabled={pending}
						className={cn(inputClass, "min-w-0 flex-1")}
						placeholder="tu_usuario"
						aria-label="Nombre de usuario"
					/>
					{submitButton}
				</div>
				<p className="text-xs text-white/40">
					Min. 3 caracteres: minúsculas, números, . _ -. Es tu acceso al iniciar
					sesión.
				</p>
			</form>
		);
	}

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="member-username" className="text-white/55">
					Usuario
				</Label>
				<Input
					id="member-username"
					name="username"
					autoComplete="username"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					disabled={pending}
					className={inputClass}
					placeholder="tu_usuario"
				/>
				<p className="text-xs text-white/40">
					3–64 caracteres: letras minúsculas, números,{" "}
					<span className="font-mono">.</span>{" "}
					<span className="font-mono">_</span>{" "}
					<span className="font-mono">-</span>. Es el nombre con el que inicias
					sesión.
				</p>
			</div>
			{submitButton}
		</form>
	);
}
