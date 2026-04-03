"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	Loader2,
	MoreHorizontal,
	Pencil,
	QrCode,
	Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	deleteMemberAction,
	updateMemberAction,
} from "@/features/members/actions/member-actions";
import type { MemberListRow } from "@/features/members/lib/get-members";
import { cn } from "@/lib/utils";

import type { Member } from "@/server/db/schema/gym-schema";

const editFormSchema = z.object({
	fullName: z.string().trim().min(1, "Nombre requerido").max(255),
	email: z.string().trim().email("Correo inválido").max(320),
	phone: z.string().trim().max(32),
	status: z.enum(["active", "inactive", "past_due"]),
});

type EditFormValues = z.infer<typeof editFormSchema>;

function statusLabel(s: Member["status"]): string {
	if (s === "active") {
		return "Activo";
	}
	if (s === "inactive") {
		return "Inactivo";
	}
	return "Vencido";
}

/** Select dropdown is portaled — don’t let Dialog treat those clicks as “outside”. */
function isInsidePortaledOverlay(target: EventTarget | null): boolean {
	if (!(target instanceof Element)) {
		return false;
	}
	return Boolean(
		target.closest("[data-radix-popper-content-wrapper]") ||
			target.closest("[data-radix-select-content]"),
	);
}

export interface MemberTableRowActionsProps {
	member: MemberListRow;
	onViewQr: () => void;
}

export function MemberTableRowActions({
	member,
	onViewQr,
}: MemberTableRowActionsProps): React.ReactElement {
	const router = useRouter();
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [pending, setPending] = useState(false);

	const form = useForm<EditFormValues>({
		resolver: zodResolver(editFormSchema),
		defaultValues: {
			fullName: member.fullName,
			email: member.email,
			phone: member.phone ?? "",
			status: member.status,
		},
	});

	useEffect(() => {
		if (!editOpen) {
			return;
		}
		form.reset({
			fullName: member.fullName,
			email: member.email,
			phone: member.phone ?? "",
			status: member.status,
		});
	}, [editOpen, member, form]);

	async function onEditSubmit(values: EditFormValues): Promise<void> {
		setPending(true);
		try {
			const result = await updateMemberAction({
				memberId: member.id,
				...values,
			});
			if (result.ok) {
				toast.success("Socio actualizado");
				setEditOpen(false);
				router.refresh();
				return;
			}
			toast.error("No se pudo guardar", { description: result.error });
			if ("fieldErrors" in result && result.fieldErrors) {
				for (const [key, messages] of Object.entries(result.fieldErrors)) {
					const msg = messages?.[0];
					if (msg && key in form.getValues()) {
						form.setError(key as keyof EditFormValues, { message: msg });
					}
				}
			}
		} finally {
			setPending(false);
		}
	}

	async function onDeleteConfirm(): Promise<void> {
		setPending(true);
		try {
			const result = await deleteMemberAction({ memberId: member.id });
			if (result.ok) {
				toast.success("Socio eliminado");
				setDeleteOpen(false);
				router.refresh();
			} else {
				toast.error("No se pudo eliminar", { description: result.error });
			}
		} finally {
			setPending(false);
		}
	}

	return (
		<>
			<div className="flex flex-wrap items-center justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={onViewQr}
					className={cn(
						"h-9 gap-2 border-slate-800 bg-black/30 text-xs font-bold uppercase tracking-wide text-white",
						"hover:border-[#E11D48]/60 hover:bg-[#E11D48]/10 hover:text-white",
					)}
				>
					<QrCode className="h-4 w-4 text-[#E11D48]" aria-hidden />
					Ver QR
					<span className="sr-only"> de {member.fullName}</span>
				</Button>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							type="button"
							variant="outline"
							size="icon"
							className="h-9 w-9 shrink-0 border-slate-800 bg-black/30 text-white hover:bg-slate-800/80"
							aria-label={`Acciones para ${member.fullName}`}
						>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48">
						<DropdownMenuItem onClick={() => setEditOpen(true)}>
							<Pencil className="mr-2 h-4 w-4" />
							Editar socio
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="text-red-400 focus:text-red-300"
							onClick={() => setDeleteOpen(true)}
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Eliminar
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent
					className="border-slate-800 bg-slate-950 sm:max-w-md"
					onPointerDownOutside={(e) => {
						if (isInsidePortaledOverlay(e.target)) {
							e.preventDefault();
						}
					}}
					onInteractOutside={(e) => {
						if (isInsidePortaledOverlay(e.target)) {
							e.preventDefault();
						}
					}}
				>
					<DialogHeader>
						<DialogTitle className="text-slate-50">Editar socio</DialogTitle>
						<DialogDescription>
							Actualiza datos de contacto y estado. El QR no cambia.
						</DialogDescription>
					</DialogHeader>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit((v) => void onEditSubmit(v))}
							className="space-y-4 pt-2"
						>
							<FormField
								control={form.control}
								name="fullName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nombre completo</FormLabel>
										<FormControl>
											<Input
												className="border-slate-800 bg-black/40 text-slate-100 focus-visible:ring-[#E11D48]"
												autoComplete="name"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Correo</FormLabel>
										<FormControl>
											<Input
												type="email"
												className="border-slate-800 bg-black/40 text-slate-100 focus-visible:ring-[#E11D48]"
												autoComplete="email"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Teléfono</FormLabel>
										<FormControl>
											<Input
												type="tel"
												className="border-slate-800 bg-black/40 text-slate-100 focus-visible:ring-[#E11D48]"
												autoComplete="tel"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Estado</FormLabel>
										<Select
											value={field.value}
											onValueChange={field.onChange}
										>
											<FormControl>
												<SelectTrigger className="border-slate-800 bg-black/40 text-slate-100">
													<SelectValue placeholder="Estado" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="active">
													{statusLabel("active")}
												</SelectItem>
												<SelectItem value="inactive">
													{statusLabel("inactive")}
												</SelectItem>
												<SelectItem value="past_due">
													{statusLabel("past_due")}
												</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogFooter className="gap-2 sm:gap-0">
								<Button
									type="button"
									variant="outline"
									onClick={() => setEditOpen(false)}
								>
									Cancelar
								</Button>
								<Button
									type="submit"
									disabled={pending}
									className="bg-[#E11D48] hover:bg-red-700"
								>
									{pending ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										"Guardar"
									)}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			<Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<DialogContent className="border-slate-800 bg-slate-950">
					<DialogHeader>
						<DialogTitle className="text-slate-50">Eliminar socio</DialogTitle>
						<DialogDescription className="text-slate-400">
							Se eliminará <strong className="text-slate-200">{member.fullName}</strong>{" "}
							y todas sus suscripciones e historial de pagos vinculados. Esta acción
							no se puede deshacer.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button
							type="button"
							variant="outline"
							onClick={() => setDeleteOpen(false)}
						>
							Cancelar
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={() => void onDeleteConfirm()}
							disabled={pending}
						>
							{pending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Eliminar definitivamente"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
