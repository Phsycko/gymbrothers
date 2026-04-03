"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format, parseISO, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { createMemberAction } from "@/features/members/actions/member-actions";
import {
	computeSubscriptionEndDate,
	formatPlanDurationLabel,
} from "@/features/plans/lib/plan-duration";
import { cn } from "@/lib/utils";

const formSchema = z.object({
	fullName: z.string().trim().min(1, "Nombre requerido").max(255),
	username: z.string().trim().min(1, "Usuario requerido").max(64),
	planId: z.string().uuid("Elige un plan"),
	startDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (AAAA-MM-DD)"),
});

export type AddMemberFormValues = z.infer<typeof formSchema>;

export type PlanPickerPlan = {
	id: string;
	name: string;
	priceCents: number;
	durationMonths: number;
	durationWeeks: number | null;
};

export interface AddMemberFormProps {
	onSuccess: () => void;
	plans: PlanPickerPlan[];
}

function isWeeklyPlan(p: PlanPickerPlan): boolean {
	return p.durationWeeks != null && p.durationWeeks > 0;
}

export function AddMemberForm({
	onSuccess,
	plans,
}: AddMemberFormProps): React.ReactElement {
	const router = useRouter();
	const weeklyPlans = useMemo(
		() => plans.filter((p) => isWeeklyPlan(p)),
		[plans],
	);
	const monthlyPlans = useMemo(
		() => plans.filter((p) => !isWeeklyPlan(p)),
		[plans],
	);

	const defaultPlanId = plans[0]?.id ?? "";

	const form = useForm<AddMemberFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			fullName: "",
			username: "",
			planId: defaultPlanId,
			startDate: format(new Date(), "yyyy-MM-dd"),
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

	async function onSubmit(values: AddMemberFormValues): Promise<void> {
		const result = await createMemberAction(values);
		if (result.ok) {
			toast.success("Socio registrado", {
				description: `${values.fullName} tiene membresía activa con la fecha indicada.`,
			});
			router.refresh();
			form.reset({
				fullName: "",
				username: "",
				planId: plans[0]?.id ?? "",
				startDate: format(new Date(), "yyyy-MM-dd"),
			});
			onSuccess();
			return;
		}
		toast.error("No se pudo registrar", {
			description: result.error,
		});
		if (result.fieldErrors) {
			for (const [key, messages] of Object.entries(result.fieldErrors)) {
				const msg = messages?.[0];
				if (msg && key in form.getValues()) {
					form.setError(key as keyof AddMemberFormValues, { message: msg });
				}
			}
		}
	}

	const noPlans = plans.length === 0;

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
				{noPlans ? (
					<p className="rounded-lg border border-amber-500/30 bg-amber-950/40 px-3 py-2 text-sm text-amber-200/90">
						No hay planes activos. Crea un plan en{" "}
						<span className="font-semibold">Planes / suscripciones</span> antes
						de dar de alta socios.
					</p>
				) : null}

				<FormField
					control={form.control}
					name="fullName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nombre completo</FormLabel>
							<FormControl>
								<Input
									placeholder="Alex Rivera"
									autoComplete="name"
									disabled={noPlans}
									className="border-slate-800 bg-black/40 text-slate-100 placeholder:text-slate-600 focus-visible:ring-[#E11D48]"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Usuario (login)</FormLabel>
							<FormControl>
								<Input
									placeholder="alexrivera"
									autoComplete="off"
									disabled={noPlans}
									className="border-slate-800 bg-black/40 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus-visible:ring-[#E11D48]"
									{...field}
								/>
							</FormControl>
							<p className="text-xs text-slate-500">
								Sin espacios; minúsculas, números, . _ — La contraseña inicial
								se asigna automáticamente.
							</p>
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
								La vigencia se calcula según el tipo de plan (semanal o
								mensual).
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
													format(parseISO(field.value), "EEEE d MMMM yyyy", {
														locale: es,
													})
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
							Duración del plan: {subscriptionPreview.durationLabel} · Cobro:{" "}
							{formatMxnFromCents(selectedPlan.priceCents)}
						</p>
					</div>
				) : null}

				<div className="flex justify-end gap-2 pt-2">
					<Button
						type="submit"
						disabled={form.formState.isSubmitting || noPlans}
						className="bg-[#E11D48] text-white hover:bg-red-700 hover:shadow-[0_0_24px_rgba(225,29,72,0.5)]"
					>
						{form.formState.isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Guardando…
							</>
						) : (
							"Registrar socio"
						)}
					</Button>
				</div>
			</form>
		</Form>
	);
}
