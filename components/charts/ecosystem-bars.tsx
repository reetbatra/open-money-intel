"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { EcosystemSummary } from "@/lib/types";
import { formatUsd } from "@/lib/utils";
import { ClientOnly } from "./client-only";

const COLOR_BY_ID: Record<string, string> = {
  agglayer: "rgb(138, 99, 255)",
  superchain: "rgb(244, 63, 94)",
  orbit: "rgb(56, 189, 248)",
  "zk-stack": "rgb(16, 185, 129)",
  independent: "rgb(245, 158, 11)",
};

export function EcosystemBars({ ecosystems }: { ecosystems: EcosystemSummary[] }) {
  const data = ecosystems.map((e) => ({ name: e.name, total: e.totalTvs, id: e.id }));
  return (
    <div className="h-72 w-full">
      <ClientOnly fallback={<div className="h-full w-full rounded-xl bg-white/[0.02]" />}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 0 }}>
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
            width={140}
          />
          <Tooltip
            contentStyle={{
              background: "rgb(18, 18, 28)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              fontSize: 12,
            }}
            formatter={(v) => [formatUsd(v as number), "Total Value Secured"]}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar dataKey="total" radius={[4, 8, 8, 4]}>
            {data.map((d) => (
              <Cell key={d.id} fill={COLOR_BY_ID[d.id] ?? "rgb(120, 120, 140)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </ClientOnly>
    </div>
  );
}
