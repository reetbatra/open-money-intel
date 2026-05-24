"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatNumber } from "@/lib/utils";
import { ClientOnly } from "./client-only";

export function ActivityChart({ data }: { data: Array<{ timestamp: number; count: number; uopsCount: number }> }) {
  return (
    <div className="h-60 w-full">
      <ClientOnly fallback={<div className="h-full w-full rounded-xl bg-white/[0.02]" />}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 0, top: 12, bottom: 0 }}>
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
            tickFormatter={(v) => formatNumber(v)}
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
            formatter={(v, name) => [formatNumber(v as number), name === "count" ? "Tx" : "UOPS"]}
          />
          <Line type="monotone" dataKey="count" stroke="rgb(138, 99, 255)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="uopsCount" stroke="rgb(244, 63, 94)" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
        </LineChart>
      </ResponsiveContainer>
      </ClientOnly>
    </div>
  );
}
