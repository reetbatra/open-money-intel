import Link from "next/link";
import { previewPrompts } from "@/lib/launch/generate";
import { latestBundle } from "@/lib/launch/store";
import { getSourceDescriptor, SOURCES } from "@/lib/launch/source";

export const dynamic = "force-dynamic";

const SCHEMA_DESCRIPTIONS: Record<string, { fields: string[]; intent: string }> = {
  onePagerSchema: {
    intent: "Single-product one-pager — drops into a deck or PDF.",
    fields: ["headline (≤80)", "subheadline (≤180)", "problem (≤280)", "solution (≤320)", "features[3-4]", "proof[2-4]", "cta{primary, secondary}"],
  },
  landingBlockSchema: {
    intent: "Landing-page block — hero, features, social proof, FAQ.",
    fields: ["hero{headline, subheadline, ctas}", "features[3-4]", "socialProof (≤280)", "faq[3-4]"],
  },
  emailNurtureSchema: {
    intent: "Five-message nurture sequence on days 0, 2, 4, 7, 10.",
    fields: ["sequence[5]{day, subject (≤80), preheader, body (120-900)}"],
  },
  linkedinAdsSchema: {
    intent: "Ten distinct LinkedIn ad angles — no duplicates allowed.",
    fields: ["variants[10]{angle, headline (≤140), intro (≤180), cta (≤28)}"],
  },
  battlecardSetSchema: {
    intent: "Honest battlecards — names where the competitor actually wins.",
    fields: ["cards[2-3]{competitor, short_take, why_we_win, where_they_win, objection_handling[2-3]}"],
  },
  bdTalkTrackSchema: {
    intent: "BD-ready call structure: opener, qualifiers, talking points, objections, close.",
    fields: ["opener", "qualifying_questions[4-6]", "talking_points[4-6]", "common_objections[3-4]", "close"],
  },
  platformBundleSchema: {
    intent: "Platform-layer narrative across all products.",
    fields: ["master_narrative (200-1200)", "bundled_pitch (150-900)", "icp_to_product_map[≥2]", "cross_product_table[≥2]"],
  },
};

function CallCard({ system, prompt, schemaName }: { system: string; prompt: string; schemaName: string }) {
  const meta = SCHEMA_DESCRIPTIONS[schemaName];
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
      <div className="border-b border-white/5 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <code className="text-xs text-violet-300">{schemaName}</code>
          {meta && <span className="text-[11px] text-zinc-500">{meta.intent}</span>}
        </div>
      </div>
      {meta && (
        <div className="px-5 py-3 border-b border-white/5">
          <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-1.5">Zod schema fields</div>
          <div className="flex flex-wrap gap-1.5">
            {meta.fields.map((f) => (
              <code key={f} className="text-[11px] text-zinc-300 bg-white/[0.04] rounded px-1.5 py-0.5">
                {f}
              </code>
            ))}
          </div>
        </div>
      )}
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
        <div className="p-5">
          <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-2">System prompt</div>
          <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">{system}</p>
        </div>
        <div className="p-5">
          <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-2">User prompt</div>
          <pre className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap font-mono">{prompt}</pre>
        </div>
      </div>
    </div>
  );
}

export default async function LaunchDebugPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; product?: string }>;
}) {
  const params = await searchParams;
  const desc = getSourceDescriptor(params?.source);
  const sourceId = desc.id;
  const prompts = previewPrompts(sourceId);
  const bundle = latestBundle(sourceId);

  const productId = params?.product ?? prompts.products[0]?.productId;
  const product = prompts.products.find((p) => p.productId === productId) ?? prompts.products[0];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8 max-w-3xl">
        <div className="text-[11px] uppercase tracking-[0.18em] text-amber-300/80">/launch/debug · observability</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">The prompts, schemas, and token economics behind every asset.</h1>
        <p className="mt-3 text-zinc-400 leading-relaxed text-sm">
          Each asset is one <code className="text-zinc-300">generateObject</code> call against a Zod schema.
          The schema enforces shape; the system prompt enforces voice and constraints; the user prompt is hydrated from{" "}
          <code className="text-zinc-300">{desc.file.split("/").pop()}</code>. Nothing in production reads free-form model output.
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs">
          <Link href={`/launch?source=${sourceId}`} className="text-violet-300 hover:underline">← Back to /launch</Link>
          <span className="text-zinc-600">|</span>
          {SOURCES.map((s) => (
            <Link
              key={s.id}
              href={`/launch/debug?source=${s.id}`}
              className={s.id === sourceId ? "text-zinc-100 font-medium" : "text-zinc-500 hover:text-zinc-300"}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </header>

      {bundle && (
        <section className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Calls per bundle" value={String(bundle.totals.callCount)} hint="1 platform + 6 per product" />
          <Stat label="Total tokens" value={bundle.totals.totalTokens.toLocaleString()} hint="Sonnet 4.6 via AI Gateway" />
          <Stat label="Total cost" value={`$${bundle.totals.totalCostUsd.toFixed(3)}`} hint="$3/M in · $15/M out" />
          <Stat label="Wall-clock" value={`${(bundle.totals.totalLatencyMs / 1000).toFixed(1)}s`} hint="6 calls in parallel per product" />
        </section>
      )}

      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-[0.18em] text-zinc-500 mb-3">Platform-layer call</h2>
        <CallCard
          system={prompts.platform.systemPrompt}
          prompt={prompts.platform.userPrompt}
          schemaName={prompts.platform.schemaName}
        />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase tracking-[0.18em] text-zinc-500">Per-product calls — {product?.productName}</h2>
          <div className="flex gap-1.5 text-xs">
            {prompts.products.map((p) => (
              <Link
                key={p.productId}
                href={`/launch/debug?source=${sourceId}&product=${p.productId}`}
                className={`rounded-full px-3 py-1 transition ${
                  p.productId === product?.productId
                    ? "bg-violet-500/15 text-violet-200 ring-1 ring-violet-400/30"
                    : "text-zinc-400 hover:bg-white/5"
                }`}
              >
                {p.productName}
              </Link>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {product?.calls.map((c) => (
            <CallCard key={c.asset} system={c.systemPrompt} prompt={c.userPrompt} schemaName={c.schemaName} />
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-sm text-zinc-300 leading-relaxed">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 mb-2">Design note · why Zod on every boundary</div>
        <p>
          The AI&apos;s job is to generate copy that fits a known shape. If the model deviates — a missing field, a string
          too long, a wrong number of email steps — the call fails closed and we know about it.
          Free-form output would compound errors silently and the PMM would lose trust in the pipeline.
        </p>
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-zinc-500">{hint}</div>}
    </div>
  );
}
