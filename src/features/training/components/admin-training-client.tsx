"use client";

import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
	createRoutineAction,
	deleteExerciseAction,
	deleteRoutineAction,
	setRoutineExercisesAction,
	updateRoutineAction,
} from "@/features/training/actions/training-actions";
import { AddExerciseForm } from "@/features/training/components/add-exercise-form";
import type {
	RoutineAssignmentMember,
	RoutineWithExerciseIds,
} from "@/features/training/lib/get-training-data";
import { muscleGroupLabelEs } from "@/features/training/lib/muscle-labels";
import { parseLottieJsonString } from "@/features/training/lib/parse-lottie-json";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/server/db/schema/gym-schema";

type Tab = "exercises" | "routines";

const ROUTINE_GENERAL_VALUE = "general";

export function AdminTrainingClient({
	exercises: initialExercises,
	routines: initialRoutines,
	assignmentMembers,
}: {
	exercises: Exercise[];
	routines: RoutineWithExerciseIds[];
	assignmentMembers: RoutineAssignmentMember[];
}): React.ReactElement {
	const router = useRouter();
	const [tab, setTab] = useState<Tab>("exercises");

	const exercises = initialExercises;
	const routines = initialRoutines;

	const exercisesById = useMemo(() => {
		const m = new Map<string, Exercise>();
		for (const e of exercises) {
			m.set(e.id, e);
		}
		return m;
	}, [exercises]);

	return (
		<div className="space-y-6 sm:space-y-8">
			<div className="min-w-0">
				<h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
					Biblioteca de entrenamiento
				</h1>
				<p className="mt-1 text-sm leading-relaxed text-slate-400">
					Videos de YouTube embebidos en la app socio; Lottie opcional. Tips de
					ejecución y rutinas desde aquí.
				</p>
			</div>

			<div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
				<button
					type="button"
					onClick={() => setTab("exercises")}
					className={cn(
						"rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
						tab === "exercises"
							? "bg-[#E11D48]/20 text-[#E11D48]"
							: "text-slate-400 hover:text-white",
					)}
				>
					Ejercicios
				</button>
				<button
					type="button"
					onClick={() => setTab("routines")}
					className={cn(
						"rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
						tab === "routines"
							? "bg-[#E11D48]/20 text-[#E11D48]"
							: "text-slate-400 hover:text-white",
					)}
				>
					Rutinas
				</button>
			</div>

			{tab === "exercises" ? (
				<ExercisesPanel exercises={exercises} onDone={() => router.refresh()} />
			) : (
				<RoutinesPanel
					routines={routines}
					exercisesById={exercisesById}
					allExercises={exercises}
					assignmentMembers={assignmentMembers}
					onDone={() => router.refresh()}
				/>
			)}
		</div>
	);
}

function ExercisesPanel({
	exercises,
	onDone,
}: {
	exercises: Exercise[];
	onDone: () => void;
}): React.ReactElement {
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<Exercise | null>(null);

	return (
		<div className="space-y-4">
			<div className="flex justify-stretch sm:justify-end">
				<Button
					type="button"
					className="h-11 w-full bg-[#E11D48] hover:bg-red-700 sm:h-10 sm:w-auto touch-manipulation"
					onClick={() => {
						setEditing(null);
						setOpen(true);
					}}
				>
					<Plus className="mr-2 h-4 w-4" />
					Nuevo ejercicio
				</Button>
			</div>

			<div className="-mx-1 overflow-x-auto px-1 sm:mx-0 sm:overflow-visible sm:px-0">
				<div className="overflow-hidden rounded-lg border border-slate-800/60 bg-slate-950/40">
					<Table className="min-w-[720px] sm:min-w-0">
						<TableHeader>
							<TableRow className="border-slate-800 hover:bg-transparent">
								<TableHead className="text-slate-500">Nombre</TableHead>
								<TableHead className="text-slate-500">Grupo</TableHead>
								<TableHead className="text-slate-500">Portada</TableHead>
								<TableHead className="text-slate-500">Lottie</TableHead>
								<TableHead className="max-w-[160px] text-slate-500">
									Video
								</TableHead>
								<TableHead className="w-[100px] text-right text-slate-500">
									Acciones
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{exercises.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="py-12 text-center text-sm text-slate-500"
									>
										Aún no hay ejercicios.
									</TableCell>
								</TableRow>
							) : (
								exercises.map((ex) => (
									<TableRow key={ex.id} className="border-slate-800/50">
										<TableCell className="font-medium text-white">
											{ex.name}
										</TableCell>
										<TableCell className="text-slate-400">
											{muscleGroupLabelEs[ex.muscleGroup]}
										</TableCell>
										<TableCell className="text-xs">
											{ex.coverImageUrl?.trim() ? (
												<span className="text-sky-400/90">URL</span>
											) : (
												<span className="text-slate-600">Defecto</span>
											)}
										</TableCell>
										<TableCell className="text-xs">
											{parseLottieJsonString(ex.lottieJson) ? (
												<span className="font-medium text-emerald-400/90">
													JSON
												</span>
											) : (
												<span className="text-slate-600">—</span>
											)}
										</TableCell>
										<TableCell className="max-w-[160px] truncate text-xs text-slate-500">
											{ex.videoUrl?.trim() ? ex.videoUrl : "—"}
										</TableCell>
										<TableCell className="text-right">
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="text-slate-400 hover:text-white"
												onClick={() => {
													setEditing(ex);
													setOpen(true);
												}}
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="text-red-400 hover:text-red-300"
												onClick={() => {
													void (async () => {
														if (
															!confirm(
																`¿Eliminar "${ex.name}"? Se quitará de las rutinas que lo usen.`,
															)
														) {
															return;
														}
														const r = await deleteExerciseAction({
															exerciseId: ex.id,
														});
														if (r.ok) {
															toast.success("Ejercicio eliminado");
															onDone();
														} else {
															toast.error(r.error);
														}
													})();
												}}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			<ExerciseFormDialog
				open={open}
				onOpenChange={setOpen}
				exercise={editing}
				onSuccess={() => {
					setOpen(false);
					setEditing(null);
					onDone();
				}}
			/>
		</div>
	);
}

function ExerciseFormDialog({
	open,
	onOpenChange,
	exercise,
	onSuccess,
}: {
	open: boolean;
	onOpenChange: (o: boolean) => void;
	exercise: Exercise | null;
	onSuccess: () => void;
}): React.ReactElement {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto border-slate-800 bg-slate-950 sm:max-w-lg">
				<AddExerciseForm
					key={exercise?.id ?? "new"}
					exercise={exercise}
					onSuccess={onSuccess}
					onCancel={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}

function RoutinesPanel({
	routines,
	exercisesById,
	allExercises,
	assignmentMembers,
	onDone,
}: {
	routines: RoutineWithExerciseIds[];
	exercisesById: Map<string, Exercise>;
	allExercises: Exercise[];
	assignmentMembers: RoutineAssignmentMember[];
	onDone: () => void;
}): React.ReactElement {
	const [createOpen, setCreateOpen] = useState(false);
	const [editRoutine, setEditRoutine] = useState<RoutineWithExerciseIds | null>(
		null,
	);
	const [editMetaRoutine, setEditMetaRoutine] =
		useState<RoutineWithExerciseIds | null>(null);

	return (
		<div className="space-y-4">
			<div className="flex justify-stretch sm:justify-end">
				<Button
					type="button"
					className="h-11 w-full bg-[#E11D48] hover:bg-red-700 sm:h-10 sm:w-auto touch-manipulation"
					onClick={() => setCreateOpen(true)}
				>
					<Plus className="mr-2 h-4 w-4" />
					Nueva rutina
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
				{routines.length === 0 ? (
					<p className="col-span-full rounded-lg border border-dashed border-slate-800 py-12 text-center text-sm text-slate-500">
						No hay rutinas. Crea una y asigna ejercicios en orden.
					</p>
				) : (
					routines.map((r) => (
						<div
							key={r.id}
							className="rounded-xl border border-slate-800 bg-red-600/10 p-4"
						>
							<p className="text-[10px] font-bold uppercase text-[#E11D48]">
								{r.level === "beginner" ? "Principiante" : "Pro"}
							</p>
							<p className="mt-1 font-semibold text-white">{r.name}</p>
							{r.description ? (
								<p className="mt-2 line-clamp-2 text-sm text-slate-400">
									{r.description}
								</p>
							) : null}
							<p className="mt-2 text-xs text-slate-500">
								{r.exerciseIds.length} ejercicio(s)
							</p>
							<p className="mt-1 text-xs text-slate-400">
								{r.assignedUserId ? (
									<>
										<span className="text-slate-500">Asignada a: </span>
										<span className="font-medium text-slate-200">
											{r.assignedToMemberName ?? "Socio"}
										</span>
									</>
								) : (
									<span className="text-slate-500">
										General — visible para todos los socios
									</span>
								)}
							</p>
							<div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
								<Button
									type="button"
									size="sm"
									variant="outline"
									className="w-full border-slate-700 sm:w-auto touch-manipulation"
									onClick={() => setEditMetaRoutine(r)}
								>
									Editar rutina
								</Button>
								<Button
									type="button"
									size="sm"
									variant="outline"
									className="w-full border-slate-700 sm:w-auto touch-manipulation"
									onClick={() => setEditRoutine(r)}
								>
									Orden de ejercicios
								</Button>
								<Button
									type="button"
									size="sm"
									variant="ghost"
									className="w-full text-red-400 sm:w-auto touch-manipulation"
									onClick={() => {
										void (async () => {
											if (!confirm(`¿Eliminar rutina "${r.name}"?`)) {
												return;
											}
											const res = await deleteRoutineAction({
												routineId: r.id,
											});
											if (res.ok) {
												toast.success("Rutina eliminada");
												onDone();
											} else {
												toast.error(res.error);
											}
										})();
									}}
								>
									Eliminar
								</Button>
							</div>
						</div>
					))
				)}
			</div>

			<RoutineCreateDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				assignmentMembers={assignmentMembers}
				onSuccess={onDone}
			/>

			<RoutineEditDialog
				open={editMetaRoutine != null}
				routine={editMetaRoutine}
				assignmentMembers={assignmentMembers}
				onOpenChange={(o) => !o && setEditMetaRoutine(null)}
				onSuccess={onDone}
			/>

			<RoutineOrderDialog
				open={editRoutine != null}
				routine={editRoutine}
				allExercises={allExercises}
				exercisesById={exercisesById}
				onOpenChange={(o) => !o && setEditRoutine(null)}
				onSuccess={onDone}
			/>
		</div>
	);
}

function RoutineCreateDialog({
	open,
	onOpenChange,
	assignmentMembers,
	onSuccess,
}: {
	open: boolean;
	onOpenChange: (o: boolean) => void;
	assignmentMembers: RoutineAssignmentMember[];
	onSuccess: () => void;
}): React.ReactElement {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [level, setLevel] = useState<"beginner" | "pro">("beginner");
	const [assignee, setAssignee] = useState<string>(ROUTINE_GENERAL_VALUE);
	const [pending, setPending] = useState(false);

	async function onSubmit(e: React.FormEvent): Promise<void> {
		e.preventDefault();
		setPending(true);
		try {
			const r = await createRoutineAction({
				name,
				description,
				level,
				assignedUserId: assignee === ROUTINE_GENERAL_VALUE ? "" : assignee,
			});
			if (r.ok) {
				toast.success("Rutina creada");
				onOpenChange(false);
				setName("");
				setDescription("");
				setAssignee(ROUTINE_GENERAL_VALUE);
				onSuccess();
			} else {
				toast.error(r.error);
			}
		} finally {
			setPending(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="border-slate-800 bg-slate-950">
				<form onSubmit={(e) => void onSubmit(e)}>
					<DialogHeader>
						<DialogTitle>Nueva rutina</DialogTitle>
						<DialogDescription>
							Después podrás definir el orden de ejercicios.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-3 py-4">
						<div className="grid gap-2">
							<Label>Nombre</Label>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								className="border-slate-800 bg-black/40"
							/>
						</div>
						<div className="grid gap-2">
							<Label>Descripción</Label>
							<Textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={2}
								className="border-slate-800 bg-black/40"
							/>
						</div>
						<div className="grid gap-2">
							<Label>Nivel</Label>
							<Select
								value={level}
								onValueChange={(v) => setLevel(v as "beginner" | "pro")}
							>
								<SelectTrigger className="border-slate-800 bg-black/40">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="beginner">Principiante</SelectItem>
									<SelectItem value="pro">Pro</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label>Asignar a socio</Label>
							<Select value={assignee} onValueChange={setAssignee}>
								<SelectTrigger className="border-slate-800 bg-black/40">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="max-h-64">
									<SelectItem value={ROUTINE_GENERAL_VALUE}>
										General (todos los socios)
									</SelectItem>
									{assignmentMembers.map((m) => (
										<SelectItem key={m.userId} value={m.userId}>
											{m.fullName}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<p className="text-xs text-slate-500">
								Solo aparecen socios con cuenta de acceso. Una rutina personal
								solo la ve el asignado; las generales las ve todo el mundo.
							</p>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={pending} className="bg-[#E11D48]">
							Crear
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function RoutineEditDialog({
	open,
	routine,
	assignmentMembers,
	onOpenChange,
	onSuccess,
}: {
	open: boolean;
	routine: RoutineWithExerciseIds | null;
	assignmentMembers: RoutineAssignmentMember[];
	onOpenChange: (o: boolean) => void;
	onSuccess: () => void;
}): React.ReactElement {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [level, setLevel] = useState<"beginner" | "pro">("beginner");
	const [assignee, setAssignee] = useState<string>(ROUTINE_GENERAL_VALUE);
	const [pending, setPending] = useState(false);

	useEffect(() => {
		if (open && routine) {
			setName(routine.name);
			setDescription(routine.description);
			setLevel(routine.level);
			setAssignee(routine.assignedUserId ?? ROUTINE_GENERAL_VALUE);
		}
	}, [open, routine]);

	async function onSubmit(e: React.FormEvent): Promise<void> {
		e.preventDefault();
		if (!routine) {
			return;
		}
		setPending(true);
		try {
			const r = await updateRoutineAction({
				routineId: routine.id,
				name,
				description,
				level,
				assignedUserId: assignee === ROUTINE_GENERAL_VALUE ? "" : assignee,
			});
			if (r.ok) {
				toast.success("Rutina actualizada");
				onOpenChange(false);
				onSuccess();
			} else {
				toast.error(r.error);
			}
		} finally {
			setPending(false);
		}
	}

	if (!routine) {
		return <></>;
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="border-slate-800 bg-slate-950">
				<form onSubmit={(e) => void onSubmit(e)}>
					<DialogHeader>
						<DialogTitle>Editar rutina</DialogTitle>
						<DialogDescription>
							Nombre, descripción, nivel y a qué socio está asignada.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-3 py-4">
						<div className="grid gap-2">
							<Label>Nombre</Label>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								className="border-slate-800 bg-black/40"
							/>
						</div>
						<div className="grid gap-2">
							<Label>Descripción</Label>
							<Textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={2}
								className="border-slate-800 bg-black/40"
							/>
						</div>
						<div className="grid gap-2">
							<Label>Nivel</Label>
							<Select
								value={level}
								onValueChange={(v) => setLevel(v as "beginner" | "pro")}
							>
								<SelectTrigger className="border-slate-800 bg-black/40">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="beginner">Principiante</SelectItem>
									<SelectItem value="pro">Pro</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label>Asignar a socio</Label>
							<Select value={assignee} onValueChange={setAssignee}>
								<SelectTrigger className="border-slate-800 bg-black/40">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="max-h-64">
									<SelectItem value={ROUTINE_GENERAL_VALUE}>
										General (todos los socios)
									</SelectItem>
									{routine.assignedUserId &&
									!assignmentMembers.some(
										(m) => m.userId === routine.assignedUserId,
									) ? (
										<SelectItem value={routine.assignedUserId}>
											{routine.assignedToMemberName ??
												"Socio actual (no en listado)"}
										</SelectItem>
									) : null}
									{assignmentMembers.map((m) => (
										<SelectItem key={m.userId} value={m.userId}>
											{m.fullName}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<p className="text-xs text-slate-500">
								Solo aparecen socios con cuenta de acceso.
							</p>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={pending} className="bg-[#E11D48]">
							Guardar
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function RoutineOrderDialog({
	open,
	routine,
	allExercises,
	exercisesById,
	onOpenChange,
	onSuccess,
}: {
	open: boolean;
	routine: RoutineWithExerciseIds | null;
	allExercises: Exercise[];
	exercisesById: Map<string, Exercise>;
	onOpenChange: (o: boolean) => void;
	onSuccess: () => void;
}): React.ReactElement {
	const [orderedIds, setOrderedIds] = useState<string[]>([]);
	const [pending, setPending] = useState(false);
	const [pickerKey, setPickerKey] = useState(0);

	useEffect(() => {
		if (open && routine) {
			setOrderedIds([...routine.exerciseIds]);
			setPickerKey((k) => k + 1);
		}
	}, [open, routine]);

	function addExercise(id: string): void {
		if (orderedIds.includes(id)) {
			return;
		}
		setOrderedIds((prev) => [...prev, id]);
		setPickerKey((k) => k + 1);
	}

	function removeAt(i: number): void {
		setOrderedIds((prev) => prev.filter((_, idx) => idx !== i));
	}

	function move(i: number, dir: -1 | 1): void {
		const j = i + dir;
		if (j < 0 || j >= orderedIds.length) {
			return;
		}
		setOrderedIds((prev) => {
			const next = [...prev];
			const t = next[i];
			const u = next[j];
			if (t === undefined || u === undefined) {
				return prev;
			}
			next[i] = u;
			next[j] = t;
			return next;
		});
	}

	async function save(): Promise<void> {
		if (!routine) {
			return;
		}
		setPending(true);
		try {
			const r = await setRoutineExercisesAction({
				routineId: routine.id,
				exerciseIds: orderedIds,
			});
			if (r.ok) {
				toast.success("Orden guardado");
				onOpenChange(false);
				onSuccess();
			} else {
				toast.error(r.error);
			}
		} finally {
			setPending(false);
		}
	}

	if (!routine) {
		return <></>;
	}

	const available = allExercises.filter((e) => !orderedIds.includes(e.id));

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto border-slate-800 bg-slate-950 sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Orden — {routine.name}</DialogTitle>
					<DialogDescription>
						Añade ejercicios y reordena con las flechas.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-2">
					<div>
						<Label className="text-slate-400">Añadir ejercicio</Label>
						{available.length === 0 ? (
							<p className="mt-1 text-sm text-slate-500">
								Todos los ejercicios están en la lista.
							</p>
						) : (
							<Select
								key={pickerKey}
								onValueChange={(id) => {
									addExercise(id);
								}}
							>
								<SelectTrigger className="mt-1 border-slate-800 bg-black/40">
									<SelectValue placeholder="Seleccionar…" />
								</SelectTrigger>
								<SelectContent className="max-h-64">
									{available.map((e) => (
										<SelectItem key={e.id} value={e.id}>
											{e.name} ({muscleGroupLabelEs[e.muscleGroup]})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>
					<ol className="space-y-2">
						{orderedIds.length === 0 ? (
							<li className="text-sm text-slate-500">Lista vacía.</li>
						) : (
							orderedIds.map((id, i) => {
								const ex = exercisesById.get(id);
								return (
									<li
										key={id}
										className="flex items-center gap-2 rounded-lg border border-slate-800 bg-red-600/10 px-2 py-2"
									>
										<span className="w-6 text-center text-xs font-bold text-[#E11D48]">
											{i + 1}
										</span>
										<span className="min-w-0 flex-1 truncate text-sm text-white">
											{ex?.name ?? id}
										</span>
										<Button
											type="button"
											size="icon"
											variant="ghost"
											className="h-8 w-8 shrink-0"
											onClick={() => move(i, -1)}
											disabled={i === 0}
										>
											<ChevronUp className="h-4 w-4" />
										</Button>
										<Button
											type="button"
											size="icon"
											variant="ghost"
											className="h-8 w-8 shrink-0"
											onClick={() => move(i, 1)}
											disabled={i === orderedIds.length - 1}
										>
											<ChevronDown className="h-4 w-4" />
										</Button>
										<Button
											type="button"
											size="icon"
											variant="ghost"
											className="h-8 w-8 shrink-0 text-red-400"
											onClick={() => removeAt(i)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</li>
								);
							})
						)}
					</ol>
				</div>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cerrar
					</Button>
					<Button
						type="button"
						className="bg-[#E11D48]"
						disabled={pending}
						onClick={() => void save()}
					>
						Guardar orden
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
