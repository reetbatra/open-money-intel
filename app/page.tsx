import { loadDashboardData, topRailMovers } from "@/lib/data";
import { Stat } from "@/components/ui/stat";
import { StablecoinAreaChart } from "@/components/charts/stablecoin-area";
import { RailBars } from "@/components/charts/rail-bars";
import { RailCard } from "@/components/data/rail-card";
import { SubscribeForm } from "@/components/subscribe-form";
import { formatUsd, formatPct, changeColor } from "@/lib/utils";
import Link from "next/link";

export const revalidate = 3600;

export default async function HomePage() {
  const data = await loadDashboardData();
  const polygon = data.rails.find((r) => r.id === "polygon-stack");
  const movers = topRailMovers(data.rails, 5);

  const lastSupply = data.stablecoinHistory.at(-1)?.supply ?? data.totalStablecoinSupply;
  const startSupply = data.stablecoinHistory[0]?.supply ?? lastSupply;
  const supply90dChange = startSupply > 0 ? (lastSupply - startSupply) / startSupply : 0;

  const polygonShareOfStables = lastSupply > 0 && polygon ? polygon.stablecoinSupply / lastSupply : 0;
  const polygonRank = [...data.rails].sort((a, b) => b.stablecoinSupply - a.stablecoinSupply).findIndex((r) => r.id === "polygon-stack") + 1;

  return (
    <div className="mx-auto max-w-7xl px-6">
      {/* HERO */}
      <section className="pt-16 pb-12 grid-noise">
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[11px] text-violet-200">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
              Live · {data.rails.length} rails tracked · updated hourly
            </div>
            <h1 className="mt-5 text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.05]">
              Onchain money,
              <br />
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
                positioned daily.
              </span>
            </h1>
            <p className="mt-5 text-lg text-zinc-400 max-w-xl">
              Competitive intelligence for the Open Money era — stablecoin rails, settlement velocity, fintech distribution.
              An AI-generated weekly briefing built around how the Polygon Open Money Stack stacks up against Tron, Solana Pay, Base, Circle, and TON.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="#subscribe"
                className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition"
              >
                Get the weekly briefing
              </Link>
              <Link
                href="/launch"
                className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/5 transition"
              >
                See the launch pipeline →
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-zinc-500">Onchain stablecoin supply · 180d</span>
                <span className={`text-xs ${changeColor(supply90dChange)}`}>{formatPct(supply90dChange)}</span>
              </div>
              <div className="mt-1 text-3xl font-semibold tabular">{formatUsd(lastSupply)}</div>
              <div className="mt-3">
                <StablecoinAreaChart data={data.stablecoinHistory} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Tracked rails"
          value={data.rails.length}
          delta={<span className="text-zinc-500">Polygon + 6 competitors</span>}
        />
        <Stat
          label="Onchain stablecoin supply"
          value={formatUsd(lastSupply)}
          delta={<span className={changeColor(supply90dChange)}>{formatPct(supply90dChange)} 180d</span>}
        />
        <Stat
          label="Polygon Stack supply"
          value={formatUsd(polygon?.stablecoinSupply ?? 0)}
          delta={<span className={changeColor(polygon?.change7d)}>{formatPct(polygon?.change7d ?? null)} 7d</span>}
        />
        <Stat
          label="Polygon Stack rank"
          value={`#${polygonRank}`}
          delta={<span className="text-zinc-500">{(polygonShareOfStables * 100).toFixed(2)}% of onchain $</span>}
        />
      </section>

      {/* RAIL CARDS */}
      <section className="mt-16">
        <header className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Payment rails at a glance</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Seven rails, one positioning question: where does Polygon win, where is the room, where do we concede?
            </p>
          </div>
          <Link href="/rails" className="text-sm text-zinc-400 hover:text-white">
            Full comparison →
          </Link>
        </header>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.rails.map((r) => (
            <RailCard key={r.id} rail={r} />
          ))}
        </div>
      </section>

      {/* BARS + MOVERS */}
      <section className="mt-16 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h3 className="font-semibold tracking-tight">Stablecoin supply by rail</h3>
          <p className="text-xs text-zinc-500 mt-1">Sum of stablecoin supply across constituent chains</p>
          <div className="mt-4">
            <RailBars rails={data.rails} />
          </div>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h3 className="font-semibold tracking-tight">Movers · 7d</h3>
          <p className="text-xs text-zinc-500 mt-1">Largest week-over-week supply shifts</p>
          <ul className="mt-4 space-y-3">
            {movers.map((m) => (
              <li key={m.id} className="flex items-center justify-between border-b border-white/5 last:border-0 pb-3 last:pb-0">
                <div>
                  <div className="text-sm font-medium">{m.name}</div>
                  <div className="text-[11px] text-zinc-500 tabular">{formatUsd(m.stablecoinSupply)} supply</div>
                </div>
                <span className={`text-sm tabular ${changeColor(m.change7d)}`}>{formatPct(m.change7d)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SUBSCRIBE */}
      <section className="mt-20" id="subscribe">
        <div className="grid lg:grid-cols-2 gap-6 items-center rounded-3xl border border-white/5 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent p-8">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">The Monday briefing</h2>
            <p className="mt-3 text-zinc-300 max-w-md">
              Every Monday: a short, AI-generated intelligence brief on stablecoin rails — what moved, what the narrative is doing, where Polygon&apos;s positioning is sharpening or eroding, with battlecards against named competitors.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-zinc-400">
              <li>· Supply shifts across seven rails — Polygon angle included</li>
              <li>· Narrative shift in the payments conversation</li>
              <li>· Open Money Stack angle — what to say differently this week</li>
              <li>· Battlecards vs Stripe/Bridge, Circle, Solana Pay, Tron, Base, TON</li>
            </ul>
          </div>
          <SubscribeForm />
        </div>
      </section>

      {/* META: Why this exists */}
      <section className="mt-20 mb-6">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Why this exists</div>
          <p className="mt-3 text-sm text-zinc-300 leading-relaxed max-w-3xl">
            Polygon is mid-pivot — from L2 scaling narrative to the <em>Open Money Stack</em>. PMM teams in mid-pivot moments need three things: a live read of how competitors are pricing the new narrative, a launch system that compresses positioning into shipped assets, and a measurement loop that says what&apos;s working. This site is a working prototype of all three.{" "}
            <Link href="/how-it-works" className="text-violet-300 hover:text-violet-200 underline-offset-4 hover:underline">
              See the architecture →
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
