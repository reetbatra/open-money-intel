import { loadDashboardData } from "@/lib/data";
import { L2Table } from "@/components/data/l2-table";
import { Stat } from "@/components/ui/stat";
import { formatUsd, formatPct, changeColor } from "@/lib/utils";
import Link from "next/link";

export const revalidate = 3600;

export default async function DashboardPage() {
  const data = await loadDashboardData();
  const agglayer = data.ecosystems.find((e) => e.id === "agglayer")!;
  const lastTvs = data.tvsHistory.at(-1)?.total ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8 max-w-3xl">
        <div className="text-[11px] uppercase tracking-[0.18em] text-amber-400/80">Legacy view · what Polygon used to optimize for</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">The L2 scoreboard that no longer scores the right game</h1>
        <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
          For three years the industry measured Polygon on this board: TVS, chain count, ecosystem rollups.
          The pivot to the Open Money Stack means the unit of comparison is now stablecoin supply per payment rail, not L2 TVS.
          This view stays because the L2 narrative still moves liquidity and competitors still pitch from it — but every decision should be made on{" "}
          <Link href="/rails" className="text-violet-300 hover:underline">/rails</Link>, not here.
        </p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat label="Total L2 TVS" value={formatUsd(data.totalTvs)} />
        <Stat label="L2 snapshot TVS" value={formatUsd(lastTvs)} delta={<span className="text-zinc-500">L2Beat aggregate</span>} />
        <Stat label="AggLayer-affiliated TVS" value={formatUsd(agglayer.totalTvs)} delta={<span className={changeColor(agglayer.avgChange7d)}>{formatPct(agglayer.avgChange7d)} 7d</span>} />
        <Stat label="L2/L3 chains" value={data.projects.length} delta={<span className="text-zinc-500">{agglayer.chainCount} in AggLayer</span>} />
      </section>

      <L2Table projects={data.projects} highlight="agglayer" />
    </div>
  );
}
