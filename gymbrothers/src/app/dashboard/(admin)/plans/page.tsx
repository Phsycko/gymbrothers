import { redirect } from "next/navigation";

/** Canonical route: /dashboard/subscription-plans */
export default function LegacyPlansRedirect() {
	redirect("/dashboard/subscription-plans");
}
