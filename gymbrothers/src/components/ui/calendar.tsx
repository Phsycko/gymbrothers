"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

import { buttonVariants } from "@/components/ui/button";

import "react-day-picker/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	components,
	...props
}: CalendarProps) {
	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn(
				"rdp-root rounded-lg border border-slate-800 bg-slate-950 p-3 text-slate-100 shadow-xl",
				className,
			)}
			style={
				{
					"--rdp-accent-color": "#E11D48",
					"--rdp-accent-background-color": "rgba(225, 29, 72, 0.18)",
					"--rdp-today-color": "#fb7185",
				} as React.CSSProperties
			}
			classNames={{
				root: cn("w-fit", classNames?.root),
				months: cn(
					"relative flex flex-col gap-4 sm:flex-row",
					classNames?.months,
				),
				month: cn("flex w-full flex-col gap-4", classNames?.month),
				nav: cn(
					"absolute inset-x-0 top-0 flex w-full items-center justify-between px-1",
					classNames?.nav,
				),
				button_previous: cn(
					buttonVariants({ variant: "outline" }),
					"h-8 w-8 bg-transparent p-0 text-slate-200 opacity-80 hover:opacity-100",
					classNames?.button_previous,
				),
				button_next: cn(
					buttonVariants({ variant: "outline" }),
					"h-8 w-8 bg-transparent p-0 text-slate-200 opacity-80 hover:opacity-100",
					classNames?.button_next,
				),
				month_caption: cn(
					"flex h-9 items-center justify-center px-10 text-sm font-medium text-slate-100",
					classNames?.month_caption,
				),
				caption_label: cn("text-sm font-medium", classNames?.caption_label),
				month_grid: cn("w-full border-collapse", classNames?.month_grid),
				weekdays: cn("flex", classNames?.weekdays),
				weekday: cn(
					"w-9 text-[0.75rem] font-normal text-slate-500",
					classNames?.weekday,
				),
				week: cn("mt-2 flex w-full", classNames?.week),
				day: cn(
					"group/day relative size-9 p-0 text-center text-sm focus-within:relative focus-within:z-20",
					classNames?.day,
				),
				day_button: cn(
					buttonVariants({ variant: "ghost" }),
					"size-9 rounded-md p-0 font-normal text-slate-200 hover:bg-slate-800 hover:text-white aria-selected:opacity-100",
					classNames?.day_button,
				),
				selected: cn(
					"rounded-md bg-[#E11D48] text-white hover:bg-[#E11D48] hover:text-white focus:bg-[#E11D48]",
					classNames?.selected,
				),
				today: cn(
					"rounded-md bg-slate-800/80 text-rose-300",
					classNames?.today,
				),
				outside: cn("text-slate-600 opacity-60", classNames?.outside),
				disabled: cn("text-slate-600 opacity-40", classNames?.disabled),
				hidden: cn("invisible", classNames?.hidden),
				...classNames,
			}}
			components={{
				Chevron: ({ orientation, ...chevronProps }) =>
					orientation === "left" ? (
						<ChevronLeft className="h-4 w-4" {...chevronProps} />
					) : (
						<ChevronRight className="h-4 w-4" {...chevronProps} />
					),
				...components,
			}}
			{...props}
		/>
	);
}
Calendar.displayName = "Calendar";

export { Calendar };
