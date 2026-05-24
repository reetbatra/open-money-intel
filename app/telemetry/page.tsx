import Link from "next/link";
import { latestBundle, saveBundle } from "@/lib/launch/store";
import { buildFallbackBundle } from "@/lib/launch/fallback";
import { getSourceDescriptor, SOURCES } from "@/lib/launch/source";
import { generateTelemetryReport, type AssetTelemetry, type Channel } from "@/lib/telemetry/generate";

export const dynamic = "force-dynamic";

const CHANNEL_ORDER: Channel[] = ["linkedin_ads", "landing_block", "email_nurture", "one_pager", "battlecards", "bd_talk_track"];

function fmtInt(n: number): string {
  return n.toLocaleString();
}
function fmtPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}
function fmtUsd(n: number): string {
  if (n === 0) return "—";
  if (n < 10) return `$${n.toFixed(2)}`;
  return `$${Math.round(n).toLocaleString()}`;
}

export default async function TelemetryPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const params = await searchParams;
  const desc = getSourceDescriptor(params?.source);
  const sourceId = desc.id;

  let bundle = latestBundle(sourceId);
  if (!bundle) {
    bundle = buildFallbackBundle(sourceId);
    saveBundle(bundle);
  }
  const report = generateTelemetryReport(bundle, 14);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8 max-w-3xl">
        <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-300/80">/telemetry · third leg</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">The measurement loop that closes positioning → assets → outcomes.</h1>
        <p className="mt-3 text-zinc-400 leading-relaxed text-sm">
          Generated assets fan out to channels. Channels produce numbers. Numbers feed back into the YAML
          via concrete edit suggestions. This is the missing leg the JD asks for: agent infrastructure that
          measures itself and shortens time-to-iterate, not a one-way content factory.
        </p>
        <div className="mt-4 flex items-center gap-3 text-xs">
          <Link href={`/launch?source=${sourceId}`} className="text-violet-300 hover:underline">← Back to /launch</Link>
          <span className="text-zinc-600">|</span>
          {SOURCES.map((s) => (
            <Link
              key={s.id}
              href={s.id === SOURCES[0].id ? "/telemetry" : `/telemetry?source=${s.id}`}
              className={s.id === sourceId ? "text-zinc-100 font-medium" : "text-zinc-500 hover:text-zinc-300"}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </header>

      <section className="mb-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">14-day window · seeded from source hash {report.sourceHash}</section>
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
        <Stat label="Impressions" value={fmtInt(report.totals.impressions)} />
        <Stat label="Engaged" value={fmtInt(report.totals.engaged)} hint={`${fmtPct(report.totals.engaged / Math.max(1, report.totals.impressions))} CTR`} />
        <Stat label="Conversions" value={fmtInt(report.totals.converted)} hint={`${fmtPct(report.totals.converted / Math.max(1, report.totals.engaged))} of engaged`} />
        <Stat label="Spend" value={fmtUsd(report.totals.spendUsd)} hint="Paid channels only" />
        <Stat label="Blended CPL" value={fmtUsd(report.totals.cplUsd)} hint={`${report.perProduct.length} products`} />
      </section>

      <section className="mb-12">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 mb-3">Per-product channel performance</div>
        <div className="space-y-4">
          {report.perProduct.map((p) => (
            <div key={p.productId} className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-zinc-100">{p.productName}</div>
                  <div className="text-[11px] text-zinc-500">{fmtInt(p.totals.impressions)} impressions · {fmtInt(p.totals.converted)} conversions · CPL {fmtUsd(p.totals.cplUsd)}</div>
                </div>
                <Link href={`/launch?source=${sourceId}#${p.productId}`} className="text-[11px] text-violet-300 hover:underline">
                  View assets →
                </Link>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.12em] text-zinc-500 text-left">
                    <th className="px-5 py-2 font-normal">Channel</th>
                    <th className="px-3 py-2 font-normal text-right">Impressions</th>
                    <th className="px-3 py-2 font-normal text-right">CTR</th>
                    <th className="px-3 py-2 font-normal text-right">Engaged</th>
                    <th className="px-3 py-2 font-normal text-right">Conv. rate</th>
                    <th className="px-3 py-2 font-normal text-right">Conversions</th>
                    <th className="px-3 py-2 font-normal text-right">Spend</th>
                    <th className="px-5 py-2 font-normal text-right">CPL</th>
                  </tr>
                </thead>
                <tbody>
                  {CHANNEL_ORDER.map((ch) => {
                    const r = p.rows.find((x) => x.asset === ch) as AssetTelemetry | undefined;
                    if (!r) return null;
                    const isTop = p.rows.reduce((best, x) => (x.conversionRate > best.conversionRate ? x : best), p.rows[0]).asset === ch;
                    return (
                      <tr key={ch} className={`border-t border-white/[0.04] ${isTop ? "bg-emerald-500/[0.04]" : ""}`}>
                        <td className="px-5 py-2.5 text-zinc-200">
                          {r.label}
                          {isTop && <span className="ml-2 text-[10px] uppercase tracking-wider text-emerald-300/80">top conv.</span>}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-zinc-300">{fmtInt(r.impressions)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-zinc-300">{fmtPct(r.ctr)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-zinc-300">{fmtInt(r.engaged)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-zinc-300">{fmtPct(r.conversionRate)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-zinc-100 font-medium">{fmtInt(r.converted)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-zinc-300">{fmtUsd(r.costUsd)}</td>
                        <td className="px-5 py-2.5 text-right tabular-nums text-zinc-300">{fmtUsd(r.cplUsd)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-300/80 mb-3">Closing the loop · YAML edit suggestions</div>
        <div className="grid md:grid-cols-2 gap-3">
          {report.insights.map((i, idx) => (
            <div key={idx} className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.03] p-5">
              <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-300/70">
                {report.perProduct.find((p) => p.productId === i.productId)?.productName} · {i.asset.replace(/_/g, " ")}
              </div>
              <div className="mt-2 text-sm text-zinc-100 leading-relaxed">{i.finding}</div>
              <div className="mt-3 text-[11px] uppercase tracking-[0.14em] text-zinc-500">Suggested YAML edit</div>
              <div className="mt-1 text-xs text-zinc-300 leading-relaxed">{i.suggestedYamlEdit}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-sm text-zinc-300 leading-relaxed">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 mb-2">Implementation note · what&apos;s real vs. demo</div>
        <p>
          Numbers are seeded deterministically from the source-of-truth hash so the loop is reproducible in a demo.
          In production, this surface reads from LinkedIn Campaign Manager, HubSpot or Marketo, GA4, and Salesforce
          opportunity stages — same shape, real attribution. The point isn&apos;t the data source, it&apos;s the feedback
          arrow: <span className="text-zinc-100">channel outcome → YAML edit → regenerate</span>.
          Most marketing stacks have the inputs and outputs but no first-class connection between them.
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
