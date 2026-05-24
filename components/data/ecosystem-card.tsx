import type { EcosystemSummary } from "@/lib/types";
import { formatUsd, formatPct, changeColor } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ACCENT: Record<string, string> = {
  agglayer: "from-violet-500/30 to-fuchsia-500/10",
  superchain: "from-rose-500/30 to-rose-500/5",
  orbit: "from-sky-500/30 to-sky-500/5",
  "zk-stack": "from-emerald-500/30 to-emerald-500/5",
  independent: "from-amber-500/30 to-amber-500/5",
};

export function EcosystemCard({ eco, spotlight }: { eco: EcosystemSummary; spotlight?: boolean }) {
  return (
    <Card className={`relative overflow-hidden ${spotlight ? "ring-1 ring-violet-400/30" : ""}`}>
      <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${ACCENT[eco.id] ?? ""} opacity-50`} />
      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold tracking-tight">{eco.name}</h3>
            {spotlight && <Badge variant="agglayer">Spotlight</Badge>}
          </div>
          <span className="text-xs text-zinc-500">{eco.chainCount} chains</span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-zinc-400 max-w-prose">{eco.description}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 tabular">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">Total TVS</div>
            <div className="text-xl font-semibold">{formatUsd(eco.totalTvs)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">Weighted 7d Δ</div>
            <div className={`text-xl font-semibold ${changeColor(eco.avgChange7d)}`}>{formatPct(eco.avgChange7d)}</div>
          </div>
        </div>
        {eco.chains.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {eco.chains.slice(0, 6).map((c) => (
              <span key={c.slug} className="text-[10px] rounded-md bg-white/5 px-1.5 py-0.5 text-zinc-300">
                {c.name}
              </span>
            ))}
            {eco.chains.length > 6 && (
              <span className="text-[10px] text-zinc-500">+{eco.chains.length - 6} more</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
