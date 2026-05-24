import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[11px] text-violet-200">
        How this is wired
      </div>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Two loops, one source of truth.</h1>
      <p className="mt-4 text-zinc-400 leading-relaxed max-w-3xl">
        Open Money Intel is a working prototype of two PMM workflows running on the same architecture:
        a competitive-monitoring loop that watches stablecoin rails, and a launch pipeline that compresses
        a positioning source into a full asset package.
      </p>

      <section className="mt-12">
        <h2 className="text-xs uppercase tracking-[0.18em] text-zinc-500 mb-5">System map</h2>
        <ArchDiagram />
      </section>

      <section className="mt-16 grid md:grid-cols-2 gap-5">
        <LoopCard
          title="Loop 1 — Monitoring"
          subtitle="Continuous · cron-driven"
          body={[
            "Pull from DefiLlama Stablecoins + L2Beat hourly (Next.js fetch revalidation).",
            "Normalize seven payment rails (Polygon Stack, Tron, Solana Pay, Base, Circle, TON, BSC) with computed 7d/30d deltas.",
            "Every Monday 08:00 IST, a Vercel cron triggers /api/cron/weekly.",
            "Claude (via Vercel AI Gateway) gets the rail data and a Polygon-PMM system prompt. It returns a Zod-validated briefing object with 4 sections.",
            "Resend dispatches the digest to subscribers. Each delivery is logged.",
          ]}
        />
        <LoopCard
          title="Loop 2 — Launch pipeline"
          subtitle="On-demand · positioning-driven"
          body={[
            "positioning/open-money-stack.yml is the single source of truth — platform-level + N products.",
            "POST /api/launch/generate parses the YAML through a Zod schema (rejects malformed positioning before any AI call).",
            "Per product, six parallel generateObject calls produce one-pager, landing block, 5-email sequence, 10 LinkedIn ads, 3 battlecards, BD talk track.",
            "One platform-level call produces the master narrative, bundled pitch, ICP-to-product map, cross-product table.",
            "Each call returns a typed object — never free-form text — so the viewer can render it without parsing.",
            "Tokens, latency, and estimated cost surface in the observability panel.",
          ]}
        />
      </section>

      <section className="mt-16">
        <h2 className="text-xs uppercase tracking-[0.18em] text-zinc-500 mb-5">Decision principles</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Principle
            title="Structured output, always"
            body="Every AI call returns a Zod-typed object. No regex on prose. Voice violations surface as schema failures, not silent drift."
          />
          <Principle
            title="One positioning source"
            body="The YAML is the bottleneck on purpose. Change tone, swap a competitor, edit a differentiator — the whole asset pack regenerates from the same source."
          />
          <Principle
            title="Fallback that's still useful"
            body="When the AI key is missing, deterministic templates produce shippable (not generic) drafts. Demos work offline; iteration with Claude is the upgrade."
          />
          <Principle
            title="Velocity surfaced"
            body="Latency + token + cost panel. The point of agent infrastructure is that ten asset families generate faster and cheaper than one PMM contractor would draft them."
          />
          <Principle
            title="Honest data"
            body="Tron is bigger than Polygon. The dashboard says so. A briefing that hides the truth fails its readers — fintech buyers do the same math."
          />
          <Principle
            title="Composable, not magic"
            body="Each loop is a small set of explicit pieces. Anyone on the team can edit the YAML, regenerate, and ship in minutes."
          />
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xs uppercase tracking-[0.18em] text-zinc-500 mb-5">Tech stack</h2>
        <Card>
          <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Stack item="Next.js 16 · App Router · Turbopack" />
            <Stack item="Vercel — Functions, cron, AI Gateway" />
            <Stack item="Claude Sonnet 4.6 via AI Gateway" />
            <Stack item="Zod schemas on every AI boundary" />
            <Stack item="Neon Postgres + Drizzle ORM" />
            <Stack item="Resend for transactional email" />
            <Stack item="DefiLlama Stablecoins · L2Beat APIs" />
            <Stack item="Tailwind 4 · Recharts" />
            <Stack item="In-memory dev fallback for everything" />
          </div>
        </Card>
      </section>

      <section className="mt-16">
        <h2 className="text-xs uppercase tracking-[0.18em] text-zinc-500 mb-5">What I&apos;d build next</h2>
        <ol className="space-y-3 text-zinc-300">
          <li>
            <span className="text-zinc-100 font-medium">Linear/Notion integration.</span>
            <span className="ml-1 text-sm">When a product update lands in Linear, auto-draft the launch pack against the new positioning and open a Notion doc for review.</span>
          </li>
          <li>
            <span className="text-zinc-100 font-medium">Live competitor-page diffing.</span>
            <span className="ml-1 text-sm">Weekly crawl of named-competitor homepages and pricing pages; alert when copy or value-prop shifts.</span>
          </li>
          <li>
            <span className="text-zinc-100 font-medium">Slack approvals.</span>
            <span className="ml-1 text-sm">Generated assets post to a Slack channel with thumbs-up gating before going live to BD.</span>
          </li>
          <li>
            <span className="text-zinc-100 font-medium">GTM telemetry layer.</span>
            <span className="ml-1 text-sm">Track time-to-market per product, BD material adoption (last-opened, last-shared), campaign performance — close the measurement loop the JD asks for.</span>
          </li>
          <li>
            <span className="text-zinc-100 font-medium">A/B-able asset variants.</span>
            <span className="ml-1 text-sm">Each landing block generates with three angles; the one with highest LinkedIn ad CTR gets promoted to the live site.</span>
          </li>
        </ol>
      </section>

      <section className="mt-20 mb-6 rounded-3xl border border-white/5 bg-white/[0.02] p-6">
        <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Why this exists</div>
        <p className="mt-3 text-sm text-zinc-300 leading-relaxed max-w-3xl">
          Open Money Intel is a demo for the{" "}
          <Link href="https://jobs.ashbyhq.com/polygon-labs/897b111d-f8ae-4759-a58e-75238ec8196d" className="text-violet-300 hover:underline">
            Polygon Labs Product Marketing Manager role
          </Link>
          . The JD describes the work directly: positioning-as-source-of-truth, AI workflows that run without a human in the loop,
          and an honest read of where Polygon is competitively winning and losing. That&apos;s what this site is.
        </p>
      </section>
    </div>
  );
}

function LoopCard({ title, subtitle, body }: { title: string; subtitle: string; body: string[] }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
      <div className="text-[10px] uppercase tracking-[0.18em] text-violet-300">{subtitle}</div>
      <h3 className="mt-2 text-xl font-semibold tracking-tight">{title}</h3>
      <ol className="mt-4 space-y-2 text-sm text-zinc-300 leading-relaxed">
        {body.map((b, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-zinc-500 font-mono tabular text-xs mt-0.5">{(i + 1).toString().padStart(2, "0")}</span>
            <span>{b}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Principle({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <div className="font-medium text-zinc-100">{title}</div>
      <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{body}</p>
    </div>
  );
}

function Stack({ item }: { item: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/30 px-4 py-3 text-sm text-zinc-300">
      <span className="text-violet-300 mr-2">›</span>
      {item}
    </div>
  );
}

function ArchDiagram() {
  return (
    <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-violet-500/[0.06] via-transparent to-fuchsia-500/[0.04] p-6 overflow-x-auto">
      <svg viewBox="0 0 900 420" className="w-full min-w-[760px] h-auto">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="rgba(212,212,216,0.7)" />
          </marker>
          <linearGradient id="card" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(18,18,28,0.95)" />
            <stop offset="100%" stopColor="rgba(18,18,28,0.6)" />
          </linearGradient>
          <linearGradient id="cardViolet" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(138,99,255,0.18)" />
            <stop offset="100%" stopColor="rgba(138,99,255,0.06)" />
          </linearGradient>
        </defs>

        {/* Data sources */}
        <Box x={20} y={30} w={170} h={64} title="DefiLlama Stables" sub="stablecoin supply per chain" />
        <Box x={20} y={110} w={170} h={64} title="L2Beat" sub="TVS, activity (secondary)" />

        {/* Loop 1 */}
        <Box x={250} y={30} w={200} h={144} title="Normalizer · /lib/data" sub="map chains → rails; compute 7d/30d Δ" violet />

        <Box x={510} y={30} w={180} h={64} title="Dashboard" sub="/rails, /briefing, /" />
        <Box x={510} y={110} w={180} h={64} title="Weekly cron" sub="generateObject → digest" violet />

        <Box x={730} y={70} w={150} h={64} title="Resend" sub="weekly email" />

        {/* Arrows for Loop 1 */}
        <Arrow x1={190} y1={62} x2={250} y2={62} />
        <Arrow x1={190} y1={142} x2={250} y2={142} />
        <Arrow x1={450} y1={62} x2={510} y2={62} />
        <Arrow x1={450} y1={142} x2={510} y2={142} />
        <Arrow x1={690} y1={142} x2={730} y2={102} />

        {/* Loop 2 */}
        <Box x={20} y={230} w={170} h={88} title="positioning/*.yml" sub="single source of truth · platform + N products" violet />
        <Box x={250} y={230} w={200} h={88} title="generateObject pipeline" sub="6 calls per product · 1 platform call · Zod-validated" violet />
        <Box x={510} y={230} w={180} h={88} title="LaunchBundle" sub="typed assets + meta" violet />
        <Box x={730} y={230} w={150} h={88} title="/launch viewer" sub="tabs · copy · export" />

        <Arrow x1={190} y1={274} x2={250} y2={274} />
        <Arrow x1={450} y1={274} x2={510} y2={274} />
        <Arrow x1={690} y1={274} x2={730} y2={274} />

        {/* Labels */}
        <text x={20} y={210} fill="rgba(212,212,216,0.5)" fontSize="11" fontFamily="monospace" letterSpacing="2">LOOP 1 · MONITORING</text>
        <text x={20} y={355} fill="rgba(212,212,216,0.5)" fontSize="11" fontFamily="monospace" letterSpacing="2">LOOP 2 · LAUNCH PIPELINE</text>

        {/* PMM cycle */}
        <Box x={20} y={370} w={860} h={40} title="" sub="PMM edits positioning.yml → regenerates → reviews → ships · time-to-market measured in minutes" />
      </svg>
    </div>
  );
}

function Box({
  x,
  y,
  w,
  h,
  title,
  sub,
  violet,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub: string;
  violet?: boolean;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={12} fill={violet ? "url(#cardViolet)" : "url(#card)"} stroke="rgba(255,255,255,0.08)" />
      {title && (
        <text x={x + 14} y={y + 26} fill="rgba(244,244,245,0.95)" fontSize="13" fontWeight={600}>
          {title}
        </text>
      )}
      <text x={x + 14} y={y + (title ? 44 : 25)} fill="rgba(212,212,216,0.65)" fontSize="11">
        {sub}
      </text>
    </g>
  );
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(212,212,216,0.5)" strokeWidth={1.5} markerEnd="url(#arrow)" />;
}
