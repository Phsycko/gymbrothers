"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { isMembershipActiveFromEndDate } from "@/features/member-portal/lib/subscription-status";
import type { PlanPickerPlan } from "@/features/members/components/add-member-form";
import { shouldPulseExpiryAlert } from "@/features/members/lib/expiry-alert";
import type { MemberListRow } from "@/features/members/lib/get-members";
import { cn } from "@/lib/utils";

import type { Member } from "@/server/db/schema/gym-schema";

import { MemberTableRowActions } from "./member-table-row-actions";
import { QrModal } from "./qr-modal";

const MotionTableRow = motion(TableRow);
const MotionArticle = motion.article;

const expiryPulseTransition = {
	duration: 2.2,
	repeat: Number.POSITIVE_INFINITY,
	ease: "easeInOut" as const,
};

const expiryPulseShadow = [
	"0 0 0 0 rgba(225, 29, 72, 0)",
	"0 0 18px 2px rgba(225, 29, 72, 0.42)",
	"0 0 0 0 rgba(225, 29, 72, 0)",
];

/**
 * Estado de membresía alineado con el portal del socio: vigencia por fecha de fin de
 * suscripción (última `end_date`), no solo el campo `members.status`.
 */
function MembershipStatusBadge({
	dbStatus,
	subscriptionEndDate,
}: {
	dbStatus: Member["status"];
	subscriptionEndDate: Date | null;
}): React.ReactElement {
	if (dbStatus === "inactive") {
		return (
			<Badge
				variant="outline"
				className="border-slate-600/55 bg-slate-950/90 font-medium text-slate-400"
			>
				Inactivo
			</Badge>
		);
	}
	if (isMembershipActiveFromEndDate(subscriptionEndDate)) {
		return (
			<Badge
				variant="outline"
				className="border-emerald-500/40 bg-emerald-950/60 font-medium text-emerald-400"
			>
				Activo
			</Badge>
		);
	}
	return (
		<Badge
			variant="outline"
			className="border-[#E11D48]/45 bg-red-950/50 font-semibold text-[#E11D48]"
		>
			Vencido
		</Badge>
	);
}

export interface MemberTableProps {
	members: MemberListRow[];
	emptyMessage: string;
	plans: PlanPickerPlan[];
}

export function MemberTable({
	members,
	emptyMessage,
	plans,
}: MemberTableProps): React.ReactElement {
	const [preview, setPreview] = useState<{
		fullName: string;
		qrIdentifier: string;
	} | null>(null);

	const pulseById = useMemo(() => {
		const map = new Map<string, boolean>();
		for (const m of members) {
			map.set(m.id, shouldPulseExpiryAlert(m));
		}
		return map;
	}, [members]);

	const rowModels = useMemo(() => {
		return members.map((m) => {
			const pulse = pulseById.get(m.id) ?? false;
			const end = m.subscriptionEndDate;
			const membershipActive = isMembershipActiveFromEndDate(end);
			const isExpiredDisplay = m.status !== "inactive" && !membershipActive;
			const dateLabel = end ? format(end, "d MMM yyyy", { locale: es }) : "—";
			const rowClass = cn(
				"border-b border-slate-800/50 transition-colors",
				pulse
					? "bg-red-950/[0.12]"
					: isExpiredDisplay
						? "bg-red-950/[0.08]"
						: "hover:bg-red-950/10",
			);
			return {
				m,
				pulse,
				end,
				membershipActive,
				isExpiredDisplay,
				dateLabel,
				rowClass,
			};
		});
	}, [members, pulseById]);

	if (members.length === 0) {
		return (
			<div className="rounded-lg border border-dashed border-slate-800/80 bg-slate-950/30 px-4 py-12 text-center sm:px-6 sm:py-14">
				<p className="text-sm text-slate-500">{emptyMessage}</p>
			</div>
		);
	}

	return (
		<TooltipProvider delayDuration={200}>
			<>
				{/* Móvil: tarjetas */}
				<div className="space-y-3 md:hidden">
					{rowModels.map(({ m, pulse, end, isExpiredDisplay, dateLabel }) => {
						const card = (
							<div className="space-y-3">
								<div className="flex flex-col gap-1">
									<span className="font-semibold leading-tight text-white">
										{m.fullName}
									</span>
									<span className="break-all text-sm text-slate-400">
										{m.email}
									</span>
								</div>
								<div className="flex flex-wrap items-center gap-2 text-sm">
									<span className="text-slate-500">Tel.</span>
									{m.phone?.trim() ? (
										<span className="font-mono text-slate-300">{m.phone}</span>
									) : (
										<span className="text-slate-600">—</span>
									)}
								</div>
								<div className="flex flex-wrap items-center gap-2">
									<MembershipStatusBadge
										dbStatus={m.status}
										subscriptionEndDate={m.subscriptionEndDate}
									/>
									<div className="flex min-w-0 flex-1 items-center gap-2">
										<span className="text-xs text-slate-500">Vence</span>
										<span
											className={cn(
												"text-sm tabular-nums",
												pulse
													? "font-bold text-[#E11D48]"
													: isExpiredDisplay && end
														? "font-semibold text-[#E11D48]"
														: end
															? "text-slate-400"
															: "text-slate-600",
											)}
										>
											{dateLabel}
										</span>
										{pulse ? (
											<Tooltip>
												<TooltipTrigger asChild>
													<button
														type="button"
														className="inline-flex shrink-0 rounded-md text-[#E11D48] outline-none ring-offset-slate-950 focus-visible:ring-2 focus-visible:ring-[#E11D48]/50"
														aria-label="Por vencer: cobrar"
													>
														<AlertTriangle className="h-4 w-4" />
													</button>
												</TooltipTrigger>
												<TooltipContent
													side="top"
													className="max-w-[240px] border-red-900/40 bg-slate-950 text-slate-100"
												>
													Pronto vence — cobrar
												</TooltipContent>
											</Tooltip>
										) : null}
									</div>
								</div>
								<div className="border-t border-slate-800/60 pt-2">
									<MemberTableRowActions
										member={m}
										plans={plans}
										onViewQr={() =>
											setPreview({
												fullName: m.fullName,
												qrIdentifier: m.qrIdentifier,
											})
										}
									/>
								</div>
							</div>
						);

						const inner = (
							<div
								className={cn(
									"rounded-xl border border-slate-800/70 bg-slate-950/50 p-4",
									pulse && "ring-1 ring-[#E11D48]/25",
								)}
							>
								{card}
							</div>
						);

						if (pulse) {
							return (
								<MotionArticle
									key={m.id}
									className="overflow-hidden rounded-xl"
									initial={false}
									animate={{ boxShadow: expiryPulseShadow }}
									transition={expiryPulseTransition}
								>
									{inner}
								</MotionArticle>
							);
						}

						return (
							<article key={m.id} className="overflow-hidden rounded-xl">
								{inner}
							</article>
						);
					})}
				</div>

				{/* Tablet+: tabla */}
				<div className="hidden overflow-x-auto md:block">
					<div className="overflow-hidden rounded-lg border border-slate-800/60 bg-slate-950/40">
						<Table className="min-w-[640px] border-0">
							<TableHeader>
								<TableRow className="border-b border-slate-800/60 hover:bg-transparent">
									<TableHead className="text-slate-500">Socio</TableHead>
									<TableHead className="text-slate-500">Teléfono</TableHead>
									<TableHead className="text-slate-500">Estado</TableHead>
									<TableHead className="min-w-[140px] text-slate-500">
										Vencimiento
									</TableHead>
									<TableHead className="min-w-[200px] text-right text-slate-500">
										Acciones
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody className="[&_tr]:border-slate-800/50">
								{rowModels.map(
									({
										m,
										pulse,
										end,
										isExpiredDisplay,
										dateLabel,
										rowClass,
									}) => {
										const cells = (
											<>
												<TableCell>
													<div className="flex flex-col gap-0.5">
														<span className="font-semibold text-white">
															{m.fullName}
														</span>
														<span className="text-sm text-slate-400">
															{m.email}
														</span>
													</div>
												</TableCell>
												<TableCell className="text-slate-300">
													{m.phone?.trim() ? (
														<span className="font-mono text-sm">{m.phone}</span>
													) : (
														<span className="text-slate-600">—</span>
													)}
												</TableCell>
												<TableCell>
													<MembershipStatusBadge
														dbStatus={m.status}
														subscriptionEndDate={m.subscriptionEndDate}
													/>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<span
															className={cn(
																"text-sm tabular-nums",
																pulse
																	? "font-bold text-[#E11D48]"
																	: isExpiredDisplay && end
																		? "font-semibold text-[#E11D48]"
																		: end
																			? "text-slate-400"
																			: "text-slate-600",
															)}
														>
															{dateLabel}
														</span>
														{pulse ? (
															<Tooltip>
																<TooltipTrigger asChild>
																	<button
																		type="button"
																		className="inline-flex shrink-0 rounded-md text-[#E11D48] outline-none ring-offset-slate-950 focus-visible:ring-2 focus-visible:ring-[#E11D48]/50"
																		aria-label="Por vencer: cobrar"
																	>
																		<AlertTriangle className="h-4 w-4" />
																	</button>
																</TooltipTrigger>
																<TooltipContent
																	side="top"
																	className="max-w-[240px] border-red-900/40 bg-slate-950 text-slate-100"
																>
																	Pronto vence — cobrar
																</TooltipContent>
															</Tooltip>
														) : null}
													</div>
												</TableCell>
												<TableCell className="text-right">
													<MemberTableRowActions
														member={m}
														plans={plans}
														onViewQr={() =>
															setPreview({
																fullName: m.fullName,
																qrIdentifier: m.qrIdentifier,
															})
														}
													/>
												</TableCell>
											</>
										);

										if (pulse) {
											return (
												<MotionTableRow
													key={m.id}
													className={rowClass}
													initial={false}
													animate={{
														boxShadow: expiryPulseShadow,
													}}
													transition={expiryPulseTransition}
												>
													{cells}
												</MotionTableRow>
											);
										}

										return (
											<TableRow key={m.id} className={rowClass}>
												{cells}
											</TableRow>
										);
									},
								)}
							</TableBody>
						</Table>
					</div>
				</div>

				{preview ? (
					<QrModal
						open
						onOpenChange={(open) => {
							if (!open) {
								setPreview(null);
							}
						}}
						memberName={preview.fullName}
						qrIdentifier={preview.qrIdentifier}
					/>
				) : null}
			</>
		</TooltipProvider>
	);
}
