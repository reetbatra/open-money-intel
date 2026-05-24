import { loadDashboardData } from "@/lib/data";
import { Stat } from "@/components/ui/stat";
import { Card } from "@/components/ui/card";
import { RailBars } from "@/components/charts/rail-bars";
import { RailCard } from "@/components/data/rail-card";
import { formatUsd, formatPct, changeColor } from "@/lib/utils";

export const revalidate = 3600;

export default async function RailsPage() {
  const data = await loadDashboardData();
  const polygon = data.rails.find((r) => r.id === "polygon-stack");
  const totalRailSupply = data.rails.reduce((s, r) => s + r.stablecoinSupply, 0);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Payment rails — full comparison</h1>
        <p className="mt-1 text-sm text-zinc-400 max-w-2xl">
          Side-by-side on the seven rails most relevant to Polygon&apos;s Open Money Stack positioning. Stablecoin supply is the unit of competition.
        </p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Rails tracked" value={data.rails.length} delta={<span className="text-zinc-500">Polygon + 6 competitors</span>} />
        <Stat label="Combined stable supply" value={formatUsd(totalRailSupply)} delta={<span className="text-zinc-500">across tracked rails</span>} />
        <Stat
          label="Polygon Stack supply"
          value={formatUsd(polygon?.stablecoinSupply ?? 0)}
          delta={<span className={changeColor(polygon?.change7d)}>{formatPct(polygon?.change7d ?? null)} 7d</span>}
        />
        <Stat
          label="Polygon vs Tron"
          value={`${polygon && data.rails[0] ? ((polygon.stablecoinSupply / Math.max(data.rails.find(r => r.id === "tron")?.stablecoinSupply ?? 1, 1)) * 100).toFixed(2) : "—"}%`}
          delta={<span className="text-zinc-500">size ratio · honest read</span>}
        />
      </section>

      <Card className="mt-10">
        <div className="p-6">
          <h3 className="font-semibold tracking-tight">Stablecoin supply by rail</h3>
          <p className="text-xs text-zinc-500 mt-1">The honest comparison. Where the dollars actually sit.</p>
          <div className="mt-4">
            <RailBars rails={data.rails} />
          </div>
        </div>
      </Card>

      <section className="mt-12 grid md:grid-cols-2 gap-4">
        {data.rails.map((r) => (
          <RailCard key={r.id} rail={r} />
        ))}
      </section>

      <section className="mt-12 overflow-x-auto rounded-2xl border border-white/5">
        <table className="w-full text-sm tabular">
          <thead className="bg-white/[0.02] text-zinc-400">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Rail</th>
              <th className="px-4 py-3 font-medium text-right">Stable supply</th>
              <th className="px-4 py-3 font-medium text-right">7d Δ</th>
              <th className="px-4 py-3 font-medium text-right">30d Δ</th>
              <th className="px-4 py-3 font-medium">Constituent chains</th>
            </tr>
          </thead>
          <tbody>
            {data.rails.map((r) => (
              <tr key={r.id} className={`border-t border-white/5 hover:bg-white/[0.02] transition ${r.isPolygonStack ? "bg-violet-500/[0.04]" : ""}`}>
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-100">{r.name}</div>
                  <div className="text-xs text-zinc-500 max-w-md">{r.description}</div>
                </td>
                <td className="px-4 py-3 text-right">{formatUsd(r.stablecoinSupply)}</td>
                <td className={`px-4 py-3 text-right ${changeColor(r.change7d)}`}>{formatPct(r.change7d)}</td>
                <td className={`px-4 py-3 text-right ${changeColor(r.change30d)}`}>{formatPct(r.change30d)}</td>
                <td className="px-4 py-3 text-zinc-400">{r.chains.join(" · ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-16">
        <Card>
          <div className="p-6">
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Methodology note</div>
            <p className="mt-3 text-sm text-zinc-300 leading-relaxed max-w-3xl">
              Stablecoin supply is the deliberate unit of comparison — not TVL, not market cap. Supply tracks the dollar liquidity actually deployed on each rail and the closest proxy for where payment activity will route. It under-counts rails that route stablecoins through bridges
              (Circle&apos;s aggregate supply via CCTP is split across Ethereum, Arbitrum, Avalanche, etc.) and over-counts rails where stables sit idle in DeFi rather than moving. Treat absolute rank as directional; treat 7d/30d deltas as the real signal.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
