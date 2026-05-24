"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatUsd } from "@/lib/utils";
import { ClientOnly } from "./client-only";
import type { PaymentRailSnapshot } from "@/lib/data/payments";

const COLOR: Record<string, string> = {
  "polygon-stack": "rgb(138, 99, 255)",
  tron: "rgb(244, 63, 94)",
  "solana-pay": "rgb(16, 185, 129)",
  "base-pay": "rgb(56, 189, 248)",
  circle: "rgb(99, 102, 241)",
  ton: "rgb(14, 165, 233)",
  bsc: "rgb(245, 158, 11)",
};

export function RailBars({ rails }: { rails: PaymentRailSnapshot[] }) {
  const data = rails.map((r) => ({ id: r.id, name: r.name, supply: r.stablecoinSupply }));
  return (
    <div className="h-80 w-full">
      <ClientOnly fallback={<div className="h-full w-full rounded-xl bg-white/[0.02]" />}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 8, bottom: 0 }}>
            <XAxis
              type="number"
              tickFormatter={(v) => formatUsd(v)}
              stroke="rgb(82, 82, 91)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="rgb(212, 212, 216)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={170}
            />
            <Tooltip
              contentStyle={{
                background: "rgb(18, 18, 28)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                fontSize: 12,
              }}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              formatter={(v) => [formatUsd(v as number), "Stablecoin supply"]}
            />
            <Bar dataKey="supply" radius={[4, 8, 8, 4]}>
              {data.map((d) => (
                <Cell key={d.id} fill={COLOR[d.id] ?? "rgb(120, 120, 140)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ClientOnly>
    </div>
  );
}
