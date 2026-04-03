"use client";

import { Megaphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	createAnnouncementAction,
	deleteAnnouncementAction,
} from "@/features/announcements/actions";
import { AnnouncementCard } from "@/features/announcements/components/announcement-card";
import { cn } from "@/lib/utils";
import type { Announcement } from "@/server/db/schema/gym-schema";

export interface AnnouncementsAdminViewProps {
	initialAnnouncements: Announcement[];
	/** Base de datos sin migración: la tabla `announcements` no existe aún. */
	missingTable?: boolean;
}

export function AnnouncementsAdminView({
	initialAnnouncements,
	missingTable = false,
}: AnnouncementsAdminViewProps): React.ReactElement {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [category, setCategory] = useState<Announcement["category"]>("event");
	const [priority, setPriority] = useState<Announcement["priority"]>("medium");
	const [preview, setPreview] = useState(false);

	const draftValid = useMemo(
		() => title.trim().length > 0 && content.trim().length > 0,
		[title, content],
	);

	function handleSubmit(e: React.FormEvent): void {
		e.preventDefault();
		if (missingTable) {
			toast.error("Aplica primero la migración de base de datos.");
			return;
		}
		if (!draftValid) {
			toast.error("Completa título y contenido.");
			return;
		}
		startTransition(() => {
			void (async () => {
				const result = await createAnnouncementAction({
					title: title.trim(),
					content: content.trim(),
					category,
					priority,
				});
				if (result.ok) {
					toast.success("Anuncio publicado");
					setTitle("");
					setContent("");
					setCategory("event");
					setPriority("medium");
					setPreview(false);
					router.refresh();
					return;
				}
				toast.error("No se pudo publicar", { description: result.error });
			})();
		});
	}

	function handleDelete(id: string): void {
		setDeletingId(id);
		startTransition(() => {
			void (async () => {
				const result = await deleteAnnouncementAction({ id });
				setDeletingId(null);
				if (result.ok) {
					toast.success("Anuncio eliminado");
					router.refresh();
					return;
				}
				toast.error("No se pudo eliminar", { description: result.error });
			})();
		});
	}

	const formLocked = missingTable;

	return (
		<div className="space-y-10">
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
					Anuncios globales
				</h1>
				<p className="mt-1 max-w-2xl text-sm text-slate-500">
					Mensajes para todo el gimnasio — visibles en la app (sin email ni SMS
					en esta fase).
				</p>
			</div>

			{missingTable ? (
				<div className="rounded-xl border border-[#E11D48]/40 bg-[#E11D48]/10 px-4 py-3 text-sm text-slate-200 shadow-[0_0_20px_rgba(225,29,72,0.15)]">
					<p className="font-semibold text-[#fca5a5]">
						Falta la tabla en la base de datos
					</p>
					<p className="mt-1 text-slate-400">
						Ejecuta en la carpeta del proyecto:{" "}
						<code className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-xs text-red-200">
							npm run db:migrate
						</code>{" "}
						(con <code className="font-mono text-xs">DATABASE_URL</code> en{" "}
						<code className="font-mono text-xs">.env.local</code>). Alternativa:
						SQL Editor en Neon → archivo{" "}
						<code className="font-mono text-xs">
							scripts/apply-announcements.sql
						</code>
						. Luego recarga esta página.
					</p>
				</div>
			) : null}

			<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
				<Card className="border-slate-800/80 bg-slate-950/50 backdrop-blur-md">
					<CardHeader>
						<CardTitle className="text-white">Nuevo anuncio</CardTitle>
						<CardDescription>
							Define prioridad y categoría; usa la vista previa antes de
							publicar.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-5">
							<div className="space-y-2">
								<Label htmlFor="ann-title">Título</Label>
								<Input
									id="ann-title"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									placeholder="Ej. Horario especial del 16 de septiembre"
									className="border-slate-800 bg-black/40 text-white"
									maxLength={255}
									disabled={formLocked}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="ann-body">Contenido</Label>
								<Textarea
									id="ann-body"
									value={content}
									onChange={(e) => setContent(e.target.value)}
									placeholder="Detalle del mensaje…"
									rows={6}
									className="min-h-[140px] resize-y border-slate-800 bg-black/40 text-white"
									disabled={formLocked}
								/>
							</div>
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<Label>Categoría</Label>
									<Select
										value={category}
										onValueChange={(v) =>
											setCategory(v as Announcement["category"])
										}
										disabled={formLocked}
									>
										<SelectTrigger className="border-slate-800 bg-black/40 text-slate-100">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="event">Evento</SelectItem>
											<SelectItem value="maintenance">Mantenimiento</SelectItem>
											<SelectItem value="promotion">Promoción</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label>Prioridad</Label>
									<Select
										value={priority}
										onValueChange={(v) =>
											setPriority(v as Announcement["priority"])
										}
										disabled={formLocked}
									>
										<SelectTrigger className="border-slate-800 bg-black/40 text-slate-100">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="low">Baja</SelectItem>
											<SelectItem value="medium">Media</SelectItem>
											<SelectItem value="high">Alta (crítico)</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-4">
								<div className="flex items-center gap-2">
									<Switch
										id="ann-preview"
										checked={preview}
										onCheckedChange={setPreview}
										disabled={formLocked}
									/>
									<Label
										htmlFor="ann-preview"
										className="cursor-pointer text-sm text-slate-400"
									>
										Vista previa
									</Label>
								</div>
								<Button
									type="submit"
									disabled={formLocked || pending || !draftValid}
									className={cn(
										"gap-2 bg-red-600 font-semibold text-white shadow-[0_0_20px_rgba(220,38,38,0.35)]",
										"hover:bg-red-700",
									)}
								>
									<Megaphone className="h-4 w-4" />
									Publicar anuncio
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>

				<div className="space-y-3 lg:sticky lg:top-24">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
						{preview ? "Vista previa" : "Vista previa (activa el interruptor)"}
					</p>
					{preview && draftValid ? (
						<AnnouncementCard
							title={title.trim()}
							content={content.trim()}
							category={category}
							priority={priority}
						/>
					) : (
						<div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/30 px-4 py-12 text-center text-sm text-slate-500">
							{preview
								? "Escribe título y contenido para previsualizar."
								: "Activa «Vista previa» para ver el cartel antes de publicar."}
						</div>
					)}
				</div>
			</div>

			<section className="space-y-4">
				<h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
					Feed actual
				</h2>
				{initialAnnouncements.length === 0 ? (
					<p className="rounded-lg border border-dashed border-slate-800 py-12 text-center text-sm text-slate-500">
						{missingTable
							? "Cuando la tabla exista, los anuncios aparecerán aquí."
							: "No hay anuncios publicados todavía."}
					</p>
				) : (
					<ul className="space-y-4">
						{initialAnnouncements.map((a) => (
							<li key={a.id}>
								<AnnouncementCard
									withEntranceMotion
									id={a.id}
									title={a.title}
									content={a.content}
									category={a.category}
									priority={a.priority}
									createdAt={a.createdAt}
									onDelete={handleDelete}
									deletePending={deletingId === a.id && pending}
								/>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}
