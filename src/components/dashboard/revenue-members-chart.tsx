"use client";

import {
	Area,
	AreaChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	formatMxnCompactFromCents,
	formatMxnFromCents,
} from "@/features/dashboard/lib/format";
import type { ChartDatum } from "@/features/dashboard/lib/types";

export interface RevenueMembersChartProps {
	data: ChartDatum[];
}

export function RevenueMembersChart({
	data,
}: RevenueMembersChartProps): React.ReactElement {
	return (
		<div>
			<Card className="border-slate-800/80 bg-slate-950/50 backdrop-blur-md">
				<CardHeader>
					<CardTitle className="text-lg">Ingresos vs altas</CardTitle>
					<CardDescription>
						Por mes: ingresos por cobros completados y socios nuevos dados de
						alta.
					</CardDescription>
				</CardHeader>
				<CardContent className="h-[320px] pl-0">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart
							data={data}
							margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
						>
							<defs>
								<linearGradient id="fillRev" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="#E11D48" stopOpacity={0.4} />
									<stop offset="100%" stopColor="#E11D48" stopOpacity={0} />
								</linearGradient>
								<linearGradient id="fillMem" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="#cbd5e1" stopOpacity={0.28} />
									<stop offset="100%" stopColor="#cbd5e1" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
							<XAxis
								dataKey="month"
								stroke="#64748b"
								fontSize={11}
								tickLine={false}
								axisLine={false}
							/>
							<YAxis
								yAxisId="rev"
								stroke="#64748b"
								fontSize={11}
								tickLine={false}
								axisLine={false}
								tickFormatter={(v: number) => formatMxnCompactFromCents(v)}
							/>
							<YAxis
								yAxisId="mem"
								orientation="right"
								stroke="#64748b"
								fontSize={11}
								tickLine={false}
								axisLine={false}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: "rgba(2, 6, 23, 0.95)",
									border: "1px solid rgb(30 41 59)",
									borderRadius: "8px",
									fontSize: "12px",
								}}
								labelStyle={{ color: "#e2e8f0" }}
								formatter={(value, name) => {
									const v = typeof value === "number" ? value : Number(value);
									if (name === "revenueCents") {
										return [formatMxnFromCents(v), "Ingresos"];
									}
									if (name === "members") {
										return [v, "Nuevos socios"];
									}
									return [v, String(name)];
								}}
							/>
							<Legend
								wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
								formatter={(value) =>
									value === "revenueCents" ? "Ingresos (MXN)" : "Nuevos socios"
								}
							/>
							<Area
								yAxisId="rev"
								type="monotone"
								dataKey="revenueCents"
								stroke="#E11D48"
								fill="url(#fillRev)"
								strokeWidth={2}
								name="revenueCents"
							/>
							<Area
								yAxisId="mem"
								type="monotone"
								dataKey="members"
								stroke="#94a3b8"
								fill="url(#fillMem)"
								strokeWidth={2}
								name="members"
							/>
						</AreaChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>
		</div>
	);
}
