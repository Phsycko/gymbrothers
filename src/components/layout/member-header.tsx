"use client";

import { Dumbbell } from "lucide-react";
import Link from "next/link";

import type { User as LuciaUser } from "@/lib/auth/auth";

import { UserMenu } from "@/components/layout/user-menu";

export interface MemberHeaderProps {
	user: LuciaUser;
}

export function MemberHeader({ user }: MemberHeaderProps): React.ReactElement {
	return (
		<header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-black/80 px-4 backdrop-blur-md md:h-16 md:px-6">
			<Link
				href="/dashboard/member"
				className="flex items-center gap-2 font-extrabold tracking-tight"
			>
				<Dumbbell
					className="h-7 w-7 shrink-0 text-[#E11D48]"
					strokeWidth={2.25}
					aria-hidden
				/>
				<span className="text-white">GYM </span>
				<span className="text-[#E11D48] drop-shadow-[0_0_12px_rgba(225,29,72,0.45)]">
					BROTHERS
				</span>
			</Link>
			<UserMenu user={user} />
		</header>
	);
}
