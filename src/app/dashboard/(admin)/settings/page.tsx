import { Construction } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPlaceholderPage(): React.ReactElement {
	return (
		<div className="mx-auto max-w-lg">
			<Card className="border-slate-800/80 bg-slate-950/50 backdrop-blur-md">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<Construction className="h-5 w-5 text-amber-500" />
						Ajustes
					</CardTitle>
				</CardHeader>
				<CardContent className="text-sm text-slate-400">
					Perfil del gimnasio, webhooks y roles llegarán aquí.
				</CardContent>
			</Card>
		</div>
	);
}
