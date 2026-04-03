"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	createExerciseAction,
	updateExerciseAction,
} from "@/features/training/actions/training-actions";
import {
	MUSCLE_GROUPS,
	muscleGroupLabelEs,
} from "@/features/training/lib/muscle-labels";
import type { Exercise } from "@/server/db/schema/gym-schema";

export function AddExerciseForm({
	exercise,
	onSuccess,
	onCancel,
}: {
	exercise: Exercise | null;
	onSuccess: () => void;
	onCancel: () => void;
}): React.ReactElement {
	const [name, setName] = useState("");
	const [muscleGroup, setMuscleGroup] = useState<Exercise["muscleGroup"]>("chest");
	const [description, setDescription] = useState("");
	const [videoUrl, setVideoUrl] = useState("");
	const [lottieJson, setLottieJson] = useState("");
	const [formTips, setFormTips] = useState("");
	const [pending, setPending] = useState(false);

	useEffect(() => {
		setName(exercise?.name ?? "");
		setMuscleGroup(exercise?.muscleGroup ?? "chest");
		setDescription(exercise?.description ?? "");
		setVideoUrl(exercise?.videoUrl ?? "");
		setLottieJson(exercise?.lottieJson ?? "");
		setFormTips(exercise?.formTips ?? "");
	}, [exercise]);

	async function handleSubmit(e: React.FormEvent): Promise<void> {
		e.preventDefault();
		setPending(true);
		try {
			const payload = {
				name,
				description,
				muscleGroup,
				lottieJson,
				videoUrl,
				formTips,
			};
			const result = exercise
				? await updateExerciseAction({ exerciseId: exercise.id, ...payload })
				: await createExerciseAction(payload);
			if (result.ok) {
				toast.success(exercise ? "Ejercicio actualizado" : "Ejercicio creado");
				onSuccess();
			} else {
				toast.error(result.error);
			}
		} finally {
			setPending(false);
		}
	}

	return (
		<form onSubmit={(e) => void handleSubmit(e)}>
			<DialogHeader>
				<DialogTitle className="text-slate-50">
					{exercise ? "Editar ejercicio" : "Nuevo ejercicio"}
				</DialogTitle>
				<DialogDescription>
					Enlace de YouTube (recomendado para la app socio) o JSON Lottie. Al menos
					uno de los dos es obligatorio.
				</DialogDescription>
			</DialogHeader>

			<div className="grid gap-4 py-4">
				<div className="grid gap-2">
					<Label htmlFor="ex-name">Nombre</Label>
					<Input
						id="ex-name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						className="border-slate-800 bg-black/40"
					/>
				</div>
				<div className="grid gap-2">
					<Label>Grupo muscular</Label>
					<Select
						value={muscleGroup}
						onValueChange={(v) => setMuscleGroup(v as Exercise["muscleGroup"])}
					>
						<SelectTrigger className="border-slate-800 bg-black/40">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{MUSCLE_GROUPS.map((mg) => (
								<SelectItem key={mg} value={mg}>
									{muscleGroupLabelEs[mg]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="ex-youtube">YouTube Video Link</Label>
					<Input
						id="ex-youtube"
						type="url"
						value={videoUrl}
						onChange={(e) => setVideoUrl(e.target.value)}
						placeholder="https://www.youtube.com/watch?v=… o https://youtu.be/…"
						className="border-slate-800 bg-black/40"
					/>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="ex-desc">Descripción</Label>
					<Textarea
						id="ex-desc"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						rows={3}
						className="border-slate-800 bg-black/40"
					/>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="ex-tips">Tips de los Brothers (ejecución)</Label>
					<Textarea
						id="ex-tips"
						value={formTips}
						onChange={(e) => setFormTips(e.target.value)}
						rows={4}
						placeholder='Ej: "No arquees la espalda" · "Controla la bajada"'
						className="border-slate-800 bg-black/40"
					/>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="ex-lottie">JSON Lottie (opcional)</Label>
					<Textarea
						id="ex-lottie"
						value={lottieJson}
						onChange={(e) => setLottieJson(e.target.value)}
						rows={6}
						spellCheck={false}
						placeholder='Opcional: objeto con "v" y "layers"…'
						className="font-mono text-xs leading-relaxed border-slate-800 bg-black/40"
					/>
				</div>
			</div>

			<DialogFooter>
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancelar
				</Button>
				<Button type="submit" disabled={pending} className="bg-[#E11D48]">
					{pending ? "Guardando…" : "Guardar"}
				</Button>
			</DialogFooter>
		</form>
	);
}
