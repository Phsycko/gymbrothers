"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
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
import { Textarea } from "@/components/ui/textarea";
import {
	createPlanAction,
	updatePlanAction,
} from "@/features/plans/actions/plan-actions";
import {
	formatCentsToMoneyInput,
	parseMoneyToCents,
} from "@/features/plans/lib/money";
import { planToDurationPreset } from "@/features/plans/lib/plan-duration";
import type { Plan } from "@/server/db/schema/gym-schema";

const formSchema = z.object({
	name: z.string().trim().min(1, "El nombre es obligatorio").max(255),
	description: z.string().max(8000),
	priceMoney: z.string().min(1, "Ingresa un precio"),
	durationPreset: z.enum(["1w", "1m", "3m", "6m", "12m"]),
});

type FormValues = z.infer<typeof formSchema>;

export interface SubscriptionPlanFormProps {
	plan?: Plan;
	onSuccess: () => void;
}

export function SubscriptionPlanForm({
	plan,
	onSuccess,
}: SubscriptionPlanFormProps): React.ReactElement {
	const router = useRouter();
	const isEdit = Boolean(plan);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: plan
			? {
					name: plan.name,
					description: plan.description,
					priceMoney: formatCentsToMoneyInput(plan.priceCents),
					durationPreset: planToDurationPreset(plan),
				}
			: {
					name: "",
					description: "",
					priceMoney: "",
					durationPreset: "1m",
				},
	});

	async function onSubmit(values: FormValues): Promise<void> {
		const centsResult = parseMoneyToCents(values.priceMoney);
		if (!centsResult.ok) {
			form.setError("priceMoney", { message: centsResult.error });
			return;
		}

		if (isEdit && plan) {
			const result = await updatePlanAction({
				planId: plan.id,
				name: values.name,
				description: values.description,
				priceCents: centsResult.cents,
				durationPreset: values.durationPreset,
			});

			if (result.ok) {
				toast.success("Plan actualizado", {
					description: `${values.name} se guardó correctamente.`,
				});
				router.refresh();
				onSuccess();
				return;
			}

			toast.error("No se pudo guardar", { description: result.error });
			if (result.fieldErrors) {
				for (const [key, messages] of Object.entries(result.fieldErrors)) {
					const msg = messages?.[0];
					if (msg && key in form.getValues()) {
						form.setError(key as keyof FormValues, { message: msg });
					}
				}
			}
			return;
		}

		const result = await createPlanAction({
			name: values.name,
			description: values.description,
			priceCents: centsResult.cents,
			durationPreset: values.durationPreset,
		});

		if (result.ok) {
			toast.success("Plan creado", {
				description: `${values.name} ya está en el catálogo.`,
			});
			form.reset({
				name: "",
				description: "",
				priceMoney: "",
				durationPreset: "1m",
			});
			router.refresh();
			onSuccess();
			return;
		}

		toast.error("No se pudo guardar el plan", { description: result.error });
		if (result.fieldErrors) {
			for (const [key, messages] of Object.entries(result.fieldErrors)) {
				const msg = messages?.[0];
				if (msg && key in form.getValues()) {
					form.setError(key as keyof FormValues, { message: msg });
				}
			}
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-1">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nombre del plan</FormLabel>
							<FormControl>
								<Input
									placeholder="Mensual premium"
									className="border-slate-800 bg-black/40 text-white placeholder:text-slate-600 focus-visible:ring-[#E11D48]"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Descripción</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Qué incluye, reglas de acceso…"
									className="min-h-[120px] resize-y border-slate-800 bg-black/40 text-white placeholder:text-slate-600 focus-visible:ring-[#E11D48]"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="priceMoney"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Precio (MXN)</FormLabel>
							<FormControl>
								<Input
									type="text"
									inputMode="decimal"
									autoComplete="off"
									placeholder="99.00"
									className="border-slate-800 bg-black/40 font-mono text-white placeholder:text-slate-600 focus-visible:ring-[#E11D48]"
									{...field}
								/>
							</FormControl>
							<FormDescription className="text-xs text-slate-500">
								Se guarda en centavos de peso — ej. 599.00 → 59,900¢
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="durationPreset"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Duración</FormLabel>
							<Select onValueChange={field.onChange} value={field.value}>
								<FormControl>
									<SelectTrigger className="border-slate-800 bg-black/40 text-slate-100">
										<SelectValue placeholder="Duración" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="1w">1 semana</SelectItem>
									<SelectItem value="1m">1 mes</SelectItem>
									<SelectItem value="3m">3 meses</SelectItem>
									<SelectItem value="6m">6 meses</SelectItem>
									<SelectItem value="12m">12 meses</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex justify-end pt-2">
					<Button
						type="submit"
						disabled={form.formState.isSubmitting}
						className="bg-[#E11D48] text-white hover:bg-red-700 hover:shadow-[0_0_24px_rgba(225,29,72,0.45)]"
					>
						{form.formState.isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Guardando…
							</>
						) : isEdit ? (
							"Guardar cambios"
						) : (
							"Crear plan"
						)}
					</Button>
				</div>
			</form>
		</Form>
	);
}
