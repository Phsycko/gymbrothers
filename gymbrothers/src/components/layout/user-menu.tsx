"use client";

import { LogOut, User } from "lucide-react";

import type { User as LuciaUser } from "@/lib/auth/auth";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/features/auth/actions/logout-action";

export interface UserMenuProps {
	user: LuciaUser;
}

function initials(handle: string): string {
	const part = handle.slice(0, 2) || "?";
	return part.toUpperCase();
}

const roleEs: Record<string, string> = {
	owner: "Propietario",
	staff: "Staff",
	member: "Socio",
};

export function UserMenu({ user }: UserMenuProps): React.ReactElement {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="relative h-10 gap-2 rounded-full px-2 text-slate-200 hover:bg-slate-800/80"
				>
					<Avatar className="h-8 w-8">
						<AvatarFallback className="bg-[#E11D48]/28 text-xs text-red-100">
							{initials(user.username)}
						</AvatarFallback>
					</Avatar>
					<span className="hidden max-w-[160px] truncate text-sm font-medium sm:inline">
						<span className="font-mono text-slate-100">{user.username}</span>
					</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>
					<div className="flex flex-col space-y-1">
						<p className="font-mono text-sm font-medium leading-none text-slate-100">
							{user.username}
						</p>
						<p className="truncate text-xs text-muted-foreground">{user.email}</p>
						<p className="text-xs capitalize text-muted-foreground">
							{roleEs[user.role] ?? user.role}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="gap-2" disabled>
					<User className="h-4 w-4" />
					Perfil
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="gap-2 text-rose-400 focus:text-rose-300"
					onSelect={(e) => {
						e.preventDefault();
						void logoutAction();
					}}
				>
					<LogOut className="h-4 w-4" />
					Cerrar sesión
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
