"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { PushNotificationsRegister } from "@/features/push/components/push-notifications-register";

export function MemberMotionLayout({
	children,
}: {
	children: ReactNode;
}): React.ReactElement {
	const pathname = usePathname();
	const hideFloatingPush = pathname === "/dashboard/member/community";
	return (
		<>
			{hideFloatingPush ? null : <PushNotificationsRegister />}
			<AnimatePresence mode="wait">
				<motion.div
					key={pathname}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
				>
					{children}
				</motion.div>
			</AnimatePresence>
		</>
	);
}
