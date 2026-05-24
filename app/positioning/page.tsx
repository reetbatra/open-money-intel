import Link from "next/link";
import { latestBundle, saveBundle } from "@/lib/launch/store";
import { buildFallbackBundle } from "@/lib/launch/fallback";
import { loadPositioningSource, SOURCES } from "@/lib/launch/source";
import type { LaunchBundle } from "@/lib/launch/types";
import type { PositioningSource } from "@/lib/launch/source";

export const dynamic = "force-dynamic";

function ensureBundle(sourceId: string): LaunchBundle {
  let b = latestBundle(sourceId);
  if (!b) {
    b = buildFallbackBundle(sourceId);
    saveBundle(b);
  }
  return b;
}

function diffSet(a: string[], b: string[]): { onlyA: string[]; onlyB: string[]; shared: string[] } {
  const setA = new Set(a.map((x) => x.toLowerCase()));
  const setB = new Set(b.map((x) => x.toLowerCase()));
  return {
    onlyA: a.filter((x) => !setB.has(x.toLowerCase())),
    onlyB: b.filter((x) => !setA.has(x.toLowerCase())),
    shared: a.filter((x) => setB.has(x.toLowerCase())),
  };
}

export default async function PositioningComparePage() {
  const [polyId, circleId] = SOURCES.map((s) => s.id);
  const polySrc = loadPositioningSource(polyId);
  const circleSrc = loadPositioningSource(circleId);
  const polyBundle = ensureBundle(polyId);
  const circleBundle = ensureBundle(circleId);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8 max-w-3xl">
        <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-300/80">/positioning · source diff</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Swap the source, watch the output change.</h1>
        <p className="mt-3 text-zinc-400 leading-relaxed text-sm">
          The Launch in a Box pipeline is positioning-driven. Changing a tone trait or a positioning statement
          in the YAML changes every downstream asset deterministically. This page shows the diff between
          two real positioning sources — Polygon&apos;s Open Money Stack and Circle&apos;s Stablecoin Network —
          and how the generated copy diverges as a result.
        </p>
        <div className="mt-3 text-xs">
          <Link href={`/launch?source=${polyId}`} className="text-violet-300 hover:underline">View Polygon assets</Link>
          <span className="text-zinc-600 mx-2">·</span>
          <Link href={`/launch?source=${circleId}`} className="text-violet-300 hover:underline">View Circle assets</Link>
        </div>
      </header>

      <Section title="Platform · category">
        <Pair left={polySrc.platform.category} right={circleSrc.platform.category} leftLabel={polySrc.platform.name} rightLabel={circleSrc.platform.name} />
      </Section>

      <Section title="Platform · one-liner">
        <Pair left={polySrc.platform.one_liner} right={circleSrc.platform.one_liner} />
      </Section>

      <Section title="Platform · positioning statement">
        <Pair left={polySrc.platform.positioning_statement.trim()} right={circleSrc.platform.positioning_statement.trim()} compact />
      </Section>

      <Section title="Voice · the constraint that bends every downstream asset">
        <div className="grid md:grid-cols-2 gap-4">
          <VoiceBlock src={polySrc} bundle={polyBundle} />
          <VoiceBlock src={circleSrc} bundle={circleBundle} />
        </div>
      </Section>

      <Section title="Generated divergence · platform-level master narrative">
        <Pair
          left={polyBundle.platform.master_narrative}
          right={circleBundle.platform.master_narrative}
          compact
          downstream
        />
      </Section>

      <Section title="Generated divergence · landing-page hero (first product)">
        <Pair
          left={`${polyBundle.products[0]?.landing_block.hero.headline}\n\n${polyBundle.products[0]?.landing_block.hero.subheadline}`}
          right={`${circleBundle.products[0]?.landing_block.hero.headline}\n\n${circleBundle.products[0]?.landing_block.hero.subheadline}`}
          leftLabel={polyBundle.products[0]?.productName ?? ""}
          rightLabel={circleBundle.products[0]?.productName ?? ""}
          downstream
        />
      </Section>

      <Section title="Generated divergence · battlecard short-take (first product, first competitor)">
        <Pair
          left={polyBundle.products[0]?.battlecards.cards[0]?.short_take ?? "—"}
          right={circleBundle.products[0]?.battlecards.cards[0]?.short_take ?? "—"}
          leftLabel={`vs ${polyBundle.products[0]?.battlecards.cards[0]?.competitor ?? "—"}`}
          rightLabel={`vs ${circleBundle.products[0]?.battlecards.cards[0]?.competitor ?? "—"}`}
          downstream
        />
      </Section>

      <Section title="Field-to-asset impact map">
        <p className="text-xs text-zinc-500 mb-3 max-w-2xl leading-relaxed">
          Editing one field in the YAML changes a predictable set of generated assets.
          This is the table the PMM uses to reason about an edit before regenerating.
        </p>
        <div className="rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-white/[0.02]">
              <tr className="text-left text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                <th className="px-4 py-3 font-normal">YAML field</th>
                <th className="px-4 py-3 font-normal">Affected assets</th>
                <th className="px-4 py-3 font-normal">Why</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              <ImpactRow field="platform.tone.voice" assets="ALL — every prompt embeds the tone block" why="System prompts include voice traits verbatim" />
              <ImpactRow field="platform.tone.forbidden_words" assets="ALL — schema accepts output but ban is enforced in prompt" why="One forbidden word means model retries the call" />
              <ImpactRow field="platform.positioning_statement" assets="Platform master narrative, bundled pitch, all product platform-context blocks" why="Hydrated into every product prompt as 'Platform positioning'" />
              <ImpactRow field="products[].differentiators" assets="One-pager features, landing FAQ, LinkedIn ad differentiator angles, battlecard 'why we win', BD talking points" why="Most-referenced field in the pipeline" />
              <ImpactRow field="products[].competitors[].positioning_vs" assets="Battlecards, LinkedIn vs-competitor angles, email day-2 message, BD objection handling" why="Competitor framing is reused across five asset types" />
              <ImpactRow field="products[].proof_points" assets="One-pager proof, landing social proof, ad proof-angle variants, email day-7 message" why="Proof is enumerated, not summarized — each item appears separately" />
              <ImpactRow field="products[].icps" assets="Landing FAQ, ICP-by-segment ad angles, BD qualifying questions, platform ICP-to-product map" why="ICP ids determine the audience-segmentation rendering" />
              <ImpactRow field="products[].primary_metric" assets="One-pager headline (sometimes), landing hero (rarely), telemetry suggestion text" why="Primary metric is the optional anchor when present" />
            </tbody>
          </table>
        </div>
      </Section>

      <section className="mt-12 rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-sm text-zinc-300 leading-relaxed">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 mb-2">Design note · why one source instead of ten prompts</div>
        <p>
          The alternative architecture is a folder of hand-written prompts for each asset type.
          That works for a single product launch but collapses when the positioning evolves or a second
          product joins — the PMM has to chase consistency across N prompts manually. With one source,
          consistency is a property of the system, not a discipline the PMM has to maintain.
        </p>
      </section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 mb-3">{title}</div>
      {children}
    </section>
  );
}

function Pair({
  left,
  right,
  leftLabel,
  rightLabel,
  compact,
  downstream,
}: {
  left: string;
  right: string;
  leftLabel?: string;
  rightLabel?: string;
  compact?: boolean;
  downstream?: boolean;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <div className={`rounded-2xl border ${downstream ? "border-violet-400/20 bg-violet-500/[0.03]" : "border-white/5 bg-white/[0.02]"} p-5`}>
        <div className="text-[10px] uppercase tracking-[0.18em] text-violet-300/80 mb-2">{leftLabel ?? "Polygon Open Money Stack"}</div>
        <p className={`${compact ? "text-xs" : "text-sm"} text-zinc-200 leading-relaxed whitespace-pre-wrap`}>{left}</p>
      </div>
      <div className={`rounded-2xl border ${downstream ? "border-cyan-400/20 bg-cyan-500/[0.03]" : "border-white/5 bg-white/[0.02]"} p-5`}>
        <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-300/80 mb-2">{rightLabel ?? "Circle Stablecoin Network"}</div>
        <p className={`${compact ? "text-xs" : "text-sm"} text-zinc-200 leading-relaxed whitespace-pre-wrap`}>{right}</p>
      </div>
    </div>
  );
}

function VoiceBlock({ src, bundle }: { src: PositioningSource; bundle: LaunchBundle }) {
  const otherId = SOURCES.find((s) => s.id !== bundle.sourceId)?.id ?? SOURCES[0].id;
  const otherSrc = loadPositioningSource(otherId);
  const voiceDiff = diffSet(src.platform.tone.voice, otherSrc.platform.tone.voice);
  const banDiff = diffSet(src.platform.tone.forbidden_words, otherSrc.platform.tone.forbidden_words);
  const isPoly = bundle.sourceId === "polygon";
  return (
    <div className={`rounded-2xl border p-5 ${isPoly ? "border-violet-400/20 bg-violet-500/[0.03]" : "border-cyan-400/20 bg-cyan-500/[0.03]"}`}>
      <div className={`text-[10px] uppercase tracking-[0.18em] mb-2 ${isPoly ? "text-violet-300/80" : "text-cyan-300/80"}`}>{src.platform.name}</div>
      <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 mt-3 mb-1.5">Voice traits</div>
      <div className="flex flex-wrap gap-1.5">
        {src.platform.tone.voice.map((v) => (
          <code
            key={v}
            className={`text-[11px] rounded px-1.5 py-0.5 ${voiceDiff.onlyA.includes(v) ? "bg-emerald-500/15 text-emerald-200" : "bg-white/[0.04] text-zinc-300"}`}
          >
            {v}
          </code>
        ))}
      </div>
      <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 mt-4 mb-1.5">Forbidden words</div>
      <div className="flex flex-wrap gap-1.5">
        {src.platform.tone.forbidden_words.map((w) => (
          <code
            key={w}
            className={`text-[11px] rounded px-1.5 py-0.5 ${banDiff.onlyA.includes(w) ? "bg-rose-500/15 text-rose-200" : "bg-white/[0.04] text-zinc-300"}`}
          >
            {w}
          </code>
        ))}
      </div>
      <div className="mt-4 text-[11px] text-zinc-500">
        <span className="text-emerald-300/80">Green</span> = unique to this source.
        <span className="ml-2 text-rose-300/80">Red</span> = ban only this source enforces.
      </div>
    </div>
  );
}

function ImpactRow({ field, assets, why }: { field: string; assets: string; why: string }) {
  return (
    <tr>
      <td className="px-4 py-2.5"><code className="text-[11px] text-violet-300">{field}</code></td>
      <td className="px-4 py-2.5 text-zinc-300">{assets}</td>
      <td className="px-4 py-2.5 text-zinc-500">{why}</td>
    </tr>
  );
}
