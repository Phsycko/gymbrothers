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
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createMemberAction } from "@/features/members/actions/member-actions";

const formSchema = z.object({
	fullName: z.string().trim().min(1, "Name is required").max(255),
	username: z.string().trim().min(1, "Usuario requerido").max(64),
});

export type AddMemberFormValues = z.infer<typeof formSchema>;

export interface AddMemberFormProps {
	onSuccess: () => void;
}

export function AddMemberForm({
	onSuccess,
}: AddMemberFormProps): React.ReactElement {
	const router = useRouter();

	const form = useForm<AddMemberFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			fullName: "",
			username: "",
		},
	});

	async function onSubmit(values: AddMemberFormValues): Promise<void> {
		const result = await createMemberAction(values);
		if (result.ok) {
			toast.success("Brother Registered", {
				description: `${values.fullName} is locked into the roster.`,
			});
			form.reset({
				fullName: "",
				username: "",
			});
			router.refresh();
			onSuccess();
			return;
		}
		toast.error("Could not add member", {
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

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
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
				<div className="flex justify-end gap-2 pt-2">
					<Button
						type="submit"
						disabled={form.formState.isSubmitting}
						className="bg-[#E11D48] text-white hover:bg-red-700 hover:shadow-[0_0_24px_rgba(225,29,72,0.5)]"
					>
						{form.formState.isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Saving…
							</>
						) : (
							"Save member"
						)}
					</Button>
				</div>
			</form>
		</Form>
	);
}
