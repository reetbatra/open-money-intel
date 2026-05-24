"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatUsd } from "@/lib/utils";
import { ClientOnly } from "./client-only";

export function TvsAreaChart({ data }: { data: Array<{ timestamp: number; total: number }> }) {
  return (
    <div className="h-72 w-full">
      <ClientOnly fallback={<div className="h-full w-full rounded-xl bg-white/[0.02]" />}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 0, top: 12, bottom: 0 }}>
          <defs>
            <linearGradient id="tvsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(138, 99, 255)" stopOpacity={0.55} />
              <stop offset="100%" stopColor="rgb(138, 99, 255)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="timestamp"
            tickFormatter={(t) => new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            stroke="rgb(82, 82, 91)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            minTickGap={40}
          />
          <YAxis
            tickFormatter={(v) => formatUsd(v)}
            stroke="rgb(82, 82, 91)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={56}
          />
          <Tooltip
            contentStyle={{
              background: "rgb(18, 18, 28)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelFormatter={(t) =>
              new Date(t as number).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            }
            formatter={(v) => [formatUsd(v as number), "TVS"]}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="rgb(138, 99, 255)"
            strokeWidth={2}
            fill="url(#tvsGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
      </ClientOnly>
    </div>
  );
}
