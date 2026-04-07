import { NextResponse } from "next/server";

import { getVapidPublicKey } from "@/server/push/web-push-config";

export const dynamic = "force-dynamic";

export function GET(): NextResponse {
	const publicKey = getVapidPublicKey();
	if (!publicKey) {
		return NextResponse.json(
			{ error: "Web Push no está configurado en el servidor." },
			{ status: 503 },
		);
	}
	return NextResponse.json({ publicKey });
}
