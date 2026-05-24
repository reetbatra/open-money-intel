import { loadDashboardData } from "@/lib/data";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatUsd, formatPct, changeColor } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 3600;

export default async function ChainPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await loadDashboardData();
  const project = data.projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const peers = data.projects
    .filter((p) => p.ecosystem === project.ecosystem && p.slug !== project.slug)
    .slice(0, 5);

  const tvsShare = data.totalTvs > 0 ? project.tvsTotal / data.totalTvs : 0;
  const stableShare = project.tvsTotal > 0 ? project.tvsStablecoin / project.tvsTotal : 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-white">
        ← back to dashboard
      </Link>
      <header className="mt-4 mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">{project.name}</h1>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <Badge variant={project.ecosystem === "other" ? "ghost" : project.ecosystem}>
              {project.ecosystem === "other" ? "Independent" : project.ecosystem}
            </Badge>
            <Badge>{project.category}</Badge>
            <Badge>{project.stage}</Badge>
            <Badge variant="ghost">Host: {project.hostChain}</Badge>
            {project.isUnderReview && <Badge variant="ghost">Under review</Badge>}
          </div>
        </div>
        <Link
          href={`https://l2beat.com/scaling/projects/${project.slug}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-zinc-400 hover:text-white"
        >
          View on L2Beat ↗
        </Link>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="TVS" value={formatUsd(project.tvsTotal)} delta={<span className={changeColor(project.change7d)}>{formatPct(project.change7d)} 7d</span>} />
        <Stat label="Stablecoin TVS" value={formatUsd(project.tvsStablecoin)} delta={<span className="text-zinc-500">{(stableShare * 100).toFixed(1)}% of TVS</span>} />
        <Stat label="Canonical TVS" value={formatUsd(project.tvsCanonical)} />
        <Stat label="Share of L2 TVS" value={`${(tvsShare * 100).toFixed(2)}%`} />
      </section>

      <section className="mt-10 grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="p-6">
            <h3 className="font-semibold tracking-tight">TVS breakdown</h3>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 tabular">
              <Bucket label="Native" value={project.tvsNative} />
              <Bucket label="Canonical" value={project.tvsCanonical} />
              <Bucket label="External" value={project.tvsExternal} />
              <Bucket label="ETH" value={project.tvsEther} />
              <Bucket label="Stablecoins" value={project.tvsStablecoin} />
              <Bucket label="BTC" value={project.tvsBtc} />
              <Bucket label="Other" value={project.tvsOther} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="font-semibold tracking-tight">Properties</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <KV k="Providers" v={project.providers.join(", ") || "—"} />
              <KV k="Purposes" v={project.purposes.join(", ") || "—"} />
              <KV k="Badges" v={project.badges.slice(0, 4).join(" · ")} />
            </ul>
          </div>
        </Card>
      </section>

      {peers.length > 0 && (
        <section className="mt-10">
          <h3 className="font-semibold tracking-tight mb-3">Ecosystem peers</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {peers.map((p) => (
              <Link key={p.slug} href={`/chains/${p.slug}`} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:bg-white/[0.04] transition">
                <div className="text-sm font-medium">{p.name}</div>
                <div className="mt-1 text-xs tabular">{formatUsd(p.tvsTotal)}</div>
                <div className={`text-xs tabular ${changeColor(p.change7d)}`}>{formatPct(p.change7d)} 7d</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Bucket({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-1 text-lg font-semibold">{formatUsd(value)}</div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <li className="flex items-start justify-between gap-3">
      <span className="text-zinc-500 text-xs uppercase tracking-wider">{k}</span>
      <span className="text-right text-zinc-200">{v}</span>
    </li>
  );
}
