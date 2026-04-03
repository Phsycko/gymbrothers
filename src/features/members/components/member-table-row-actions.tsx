"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format, parseISO, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import {
	CalendarDays,
	Loader2,
	MoreHorizontal,
	Pencil,
	QrCode,
	Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { formatMxnFromCents } from "@/features/dashboard/lib/format";
import {
	deleteMemberAction,
	updateMemberAction,
} from "@/features/members/actions/member-actions";
import type { PlanPickerPlan } from "@/features/members/components/add-member-form";
import type { MemberListRow } from "@/features/members/lib/get-members";
import {
	computeSubscriptionEndDate,
	formatPlanDurationLabel,
} from "@/features/plans/lib/plan-duration";
import { cn } from "@/lib/utils";

import type { Member } from "@/server/db/schema/gym-schema";

const editFormSchema = z.object({
	fullName: z.string().trim().min(1, "Nombre requerido").max(255),
	email: z.string().trim().email("Correo inválido").max(320),
	phone: z.string().trim().max(32),
	status: z.enum(["active", "inactive", "past_due"]),
	planId: z.string().uuid("Elige un plan"),
	startDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (AAAA-MM-DD)"),
});

type EditFormValues = z.infer<typeof editFormSchema>;

function isWeeklyPlan(p: PlanPickerPlan): boolean {
	return p.durationWeeks != null && p.durationWeeks > 0;
}

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
	plans: PlanPickerPlan[];
	onViewQr: () => void;
}

function resolveDefaultPlanId(
	m: MemberListRow,
	plans: PlanPickerPlan[],
): string {
	if (plans.length === 0) {
		return "";
	}
	if (
		m.subscriptionPlanId &&
		plans.some((p) => p.id === m.subscriptionPlanId)
	) {
		return m.subscriptionPlanId;
	}
	return plans[0]?.id ?? "";
}

export function MemberTableRowActions({
	member,
	plans,
	onViewQr,
}: MemberTableRowActionsProps): React.ReactElement {
	const router = useRouter();
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [pending, setPending] = useState(false);

	const weeklyPlans = useMemo(
		() => plans.filter((p) => isWeeklyPlan(p)),
		[plans],
	);
	const monthlyPlans = useMemo(
		() => plans.filter((p) => !isWeeklyPlan(p)),
		[plans],
	);

	const form = useForm<EditFormValues>({
		resolver: zodResolver(editFormSchema),
		defaultValues: {
			fullName: member.fullName,
			email: member.email,
			phone: member.phone ?? "",
			status: member.status,
			planId: resolveDefaultPlanId(member, plans),
			startDate: member.subscriptionStartDate
				? format(member.subscriptionStartDate, "yyyy-MM-dd")
				: format(new Date(), "yyyy-MM-dd"),
		},
	});

	const planId = form.watch("planId");
	const startDateStr = form.watch("startDate");

	const selectedPlan = useMemo(
		() => plans.find((p) => p.id === planId),
		[plans, planId],
	);

	const subscriptionPreview = useMemo(() => {
		if (!selectedPlan || !startDateStr) {
			return null;
		}
		const start = startOfDay(parseISO(startDateStr));
		if (Number.isNaN(start.getTime())) {
			return null;
		}
		const end = computeSubscriptionEndDate(start, selectedPlan);
		return {
			start,
			end,
			durationLabel: formatPlanDurationLabel(selectedPlan),
		};
	}, [selectedPlan, startDateStr]);

	const calendarSelected = useMemo(() => {
		const d = parseISO(startDateStr);
		return Number.isNaN(d.getTime()) ? undefined : d;
	}, [startDateStr]);

	useEffect(() => {
		if (!editOpen) {
			return;
		}
		form.reset({
			fullName: member.fullName,
			email: member.email,
			phone: member.phone ?? "",
			status: member.status,
			planId: resolveDefaultPlanId(member, plans),
			startDate: member.subscriptionStartDate
				? format(member.subscriptionStartDate, "yyyy-MM-dd")
				: format(new Date(), "yyyy-MM-dd"),
		});
	}, [editOpen, member, form, plans]);

	const noPlans = plans.length === 0;

	async function onEditSubmit(values: EditFormValues): Promise<void> {
		setPending(true);
		try {
			const result = await updateMemberAction({
				memberId: member.id,
				fullName: values.fullName,
				email: values.email,
				phone: values.phone,
				status: values.status,
				planId: values.planId,
				startDate: values.startDate,
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
					className="max-h-[90vh] overflow-y-auto border-slate-800 bg-slate-950 sm:max-w-lg"
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
							Datos de contacto, estado, plan e inicio de membresía. El QR no
							cambia; la vigencia se recalcula según el plan.
						</DialogDescription>
					</DialogHeader>
					{noPlans ? (
						<p className="rounded-lg border border-amber-500/30 bg-amber-950/40 px-3 py-2 text-sm text-amber-200/90">
							No hay planes activos. Crea un plan antes de ajustar la membresía.
						</p>
					) : null}
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
										<Select value={field.value} onValueChange={field.onChange}>
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

							<FormField
								control={form.control}
								name="planId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Plan</FormLabel>
										<Select
											disabled={noPlans}
											value={field.value}
											onValueChange={field.onChange}
										>
											<FormControl>
												<SelectTrigger className="border-slate-800 bg-slate-950 text-slate-100">
													<SelectValue placeholder="Selecciona plan" />
												</SelectTrigger>
											</FormControl>
											<SelectContent className="max-h-72">
												{weeklyPlans.length > 0 ? (
													<SelectGroup>
														<SelectLabel className="text-slate-500">
															Semanal
														</SelectLabel>
														{weeklyPlans.map((p) => (
															<SelectItem key={p.id} value={p.id}>
																{p.name} — {formatMxnFromCents(p.priceCents)} (
																{formatPlanDurationLabel(p)})
															</SelectItem>
														))}
													</SelectGroup>
												) : null}
												{monthlyPlans.length > 0 ? (
													<SelectGroup>
														<SelectLabel className="text-slate-500">
															Mensual
														</SelectLabel>
														{monthlyPlans.map((p) => (
															<SelectItem key={p.id} value={p.id}>
																{p.name} — {formatMxnFromCents(p.priceCents)} (
																{formatPlanDurationLabel(p)})
															</SelectItem>
														))}
													</SelectGroup>
												) : null}
											</SelectContent>
										</Select>
										<p className="text-xs text-slate-500">
											Se actualiza la suscripción vigente (la que define el
											vencimiento en el listado).
										</p>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="startDate"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>Inicio de membresía</FormLabel>
										<div className="flex flex-col gap-2 sm:flex-row sm:items-start">
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															type="button"
															variant="outline"
															disabled={noPlans}
															className={cn(
																"w-full justify-start border-slate-800 bg-slate-950 text-left font-normal text-slate-100 hover:bg-slate-900 sm:min-w-[240px]",
																!field.value && "text-slate-500",
															)}
														>
															<CalendarDays className="mr-2 h-4 w-4 text-[#E11D48]" />
															{field.value ? (
																format(
																	parseISO(field.value),
																	"EEEE d MMMM yyyy",
																	{
																		locale: es,
																	},
																)
															) : (
																<span>Elige fecha</span>
															)}
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent
													className="w-auto border-slate-800 bg-slate-950 p-0"
													align="start"
												>
													<Calendar
														mode="single"
														weekStartsOn={1}
														locale={es}
														selected={calendarSelected}
														onSelect={(d) => {
															if (d) {
																field.onChange(format(d, "yyyy-MM-dd"));
															}
														}}
														disabled={noPlans}
													/>
												</PopoverContent>
											</Popover>
											<div className="flex flex-wrap gap-2">
												<Button
													type="button"
													size="sm"
													variant="secondary"
													disabled={noPlans}
													className="border border-slate-800 bg-slate-900 text-xs text-slate-200"
													onClick={() => {
														field.onChange(format(new Date(), "yyyy-MM-dd"));
													}}
												>
													Hoy
												</Button>
												<Button
													type="button"
													size="sm"
													variant="secondary"
													disabled={noPlans}
													className="border border-slate-800 bg-slate-900 text-xs text-slate-200"
													onClick={() => {
														field.onChange(
															format(addDays(new Date(), 1), "yyyy-MM-dd"),
														);
													}}
												>
													Mañana
												</Button>
											</div>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>

							{subscriptionPreview && selectedPlan ? (
								<div className="rounded-lg border border-[#E11D48]/35 bg-red-950/30 px-3 py-3 text-sm">
									<p className="font-semibold text-slate-100">Vista previa</p>
									<p className="mt-1 text-slate-300">
										<span className="text-slate-500">Vence: </span>
										<span className="font-medium text-white">
											{format(subscriptionPreview.end, "EEEE d MMMM yyyy", {
												locale: es,
											})}
										</span>
									</p>
									<p className="mt-0.5 text-xs text-slate-500">
										Duración: {subscriptionPreview.durationLabel} · Plan:{" "}
										{formatMxnFromCents(selectedPlan.priceCents)}
									</p>
								</div>
							) : null}

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
									disabled={pending || noPlans}
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
							Se eliminará{" "}
							<strong className="text-slate-200">{member.fullName}</strong> y
							todas sus suscripciones e historial de pagos vinculados. Esta
							acción no se puede deshacer.
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
