"use client";

import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export interface QrModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	memberName: string;
	/** Encoded into the QR pattern; only this string is stored server-side. */
	qrIdentifier: string;
}

export function QrModal({
	open,
	onOpenChange,
	memberName,
	qrIdentifier,
}: QrModalProps): React.ReactElement {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="overflow-hidden border-slate-800 bg-slate-950 p-0 sm:max-w-sm">
				<motion.div
					className="px-6 pb-6 pt-6"
					initial={{ opacity: 0, scale: 0.94, y: 10 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					transition={{
						duration: 0.28,
						ease: [0.22, 1, 0.36, 1],
					}}
				>
					<DialogHeader className="space-y-2 text-left">
						<DialogTitle className="text-slate-50">
							GYM BROTHERS · Member QR
						</DialogTitle>
						<DialogDescription className="text-slate-400">
							High-density code from the stored identifier — no image saved in
							Neon.
						</DialogDescription>
					</DialogHeader>
					<div className="mt-6 flex flex-col items-center gap-5">
						<p className="text-center text-sm font-semibold text-white">
							{memberName}
						</p>
						<motion.div
							className="rounded-xl border border-[#E11D48]/25 bg-white p-4 shadow-[0_0_32px_rgba(225,29,72,0.2)]"
							initial={{ opacity: 0.85 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.06, duration: 0.2 }}
						>
							<QRCodeSVG
								value={qrIdentifier}
								size={256}
								level="H"
								includeMargin
								bgColor="#ffffff"
								fgColor="#020617"
							/>
						</motion.div>
						<p className="max-w-full break-all text-center font-mono text-[11px] leading-relaxed text-slate-500">
							{qrIdentifier}
						</p>
					</div>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
