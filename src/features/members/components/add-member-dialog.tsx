"use client";

import { UserPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { AddMemberForm } from "./add-member-form";

export function AddMemberDialog(): React.ReactElement {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					type="button"
					className={cn(
						"h-11 gap-2 rounded-lg border-0 bg-[#E11D48] px-5 text-xs font-extrabold uppercase tracking-[0.18em] text-white",
						"shadow-[0_0_22px_rgba(225,29,72,0.35)] transition-all",
						"hover:bg-red-700 hover:shadow-[0_0_32px_rgba(225,29,72,0.55)]",
						"focus-visible:ring-2 focus-visible:ring-[#E11D48] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
					)}
				>
					<UserPlus className="h-4 w-4 stroke-[2.5] text-white" aria-hidden />
					Add Member
				</Button>
			</DialogTrigger>
			<DialogContent className="border-slate-800 bg-slate-950 sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-slate-50">Add member</DialogTitle>
					<DialogDescription>
						Register a brother — a unique QR identifier is generated
						automatically.
					</DialogDescription>
				</DialogHeader>
				<AddMemberForm onSuccess={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
}
