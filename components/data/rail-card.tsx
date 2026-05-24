import type { PaymentRailSnapshot } from "@/lib/data/payments";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StablecoinAreaChart } from "@/components/charts/stablecoin-area";
import { formatUsd, formatPct, changeColor } from "@/lib/utils";

const COLOR: Record<string, string> = {
  "polygon-stack": "rgb(138, 99, 255)",
  tron: "rgb(244, 63, 94)",
  "solana-pay": "rgb(16, 185, 129)",
  "base-pay": "rgb(56, 189, 248)",
  circle: "rgb(99, 102, 241)",
  ton: "rgb(14, 165, 233)",
  bsc: "rgb(245, 158, 11)",
};

export function RailCard({ rail, compact }: { rail: PaymentRailSnapshot; compact?: boolean }) {
  return (
    <Card className={`relative overflow-hidden ${rail.isPolygonStack ? "ring-1 ring-violet-400/30" : ""}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold tracking-tight">{rail.name}</h3>
              {rail.isPolygonStack && <Badge variant="agglayer">Spotlight</Badge>}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400 max-w-prose">{rail.description}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 tabular">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">Stable supply</div>
            <div className="text-xl font-semibold">{formatUsd(rail.stablecoinSupply)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">7d Δ</div>
            <div className={`text-xl font-semibold ${changeColor(rail.change7d)}`}>{formatPct(rail.change7d)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">30d Δ</div>
            <div className={`text-xl font-semibold ${changeColor(rail.change30d)}`}>{formatPct(rail.change30d)}</div>
          </div>
        </div>

        {!compact && rail.history.length > 0 && (
          <div className="mt-4 -mx-2">
            <StablecoinAreaChart data={rail.history} color={COLOR[rail.id] ?? "rgb(120,120,140)"} height={120} />
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-1">
          {rail.chains.map((c) => (
            <span key={c} className="text-[10px] rounded-md bg-white/5 px-1.5 py-0.5 text-zinc-300">
              {c}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
