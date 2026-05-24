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
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">L2 legacy view</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Where the L2 narrative still moves money</h1>
        <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
          Polygon&apos;s primary positioning now centers on the Open Money Stack, not the L2 scaling story.
          This view stays because the L2 narrative still drives a meaningful share of stablecoin liquidity — and competitors are still framing pitches around it.
          Treat as <em>secondary intel</em>. The primary lens is on <Link href="/rails" className="text-violet-300 hover:underline">/rails</Link>.
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
