import { getLatestDigest } from "@/lib/db/client";
import type { DigestPayload } from "@/lib/types";
import { formatUsd, formatPct, changeColor } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubscribeForm } from "@/components/subscribe-form";

export const revalidate = 600;

export default async function BriefingPage() {
  const latest = await getLatestDigest();

  if (!latest) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-3xl font-semibold tracking-tight">Briefing</h1>
        <p className="mt-3 text-zinc-400">
          The first briefing hasn&apos;t been generated yet. Subscribe to be on the list when it lands Monday.
        </p>
        <div className="mt-8">
          <SubscribeForm />
        </div>
      </div>
    );
  }

  const payload = latest.payload as DigestPayload;
  const polygon = payload.railComparison.find((r) => r.isPolygonStack);
  const tron = payload.railComparison.find((r) => r.id === "tron");
  const dateLabel = new Date(payload.generatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Badge variant="agglayer">Weekly · {dateLabel}</Badge>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Open Money briefing</h1>
      <div className="mt-3 text-sm text-zinc-400">
        Total stablecoin supply <span className="text-zinc-200 tabular">{formatUsd(payload.totalStablecoinSupply)}</span>
        {polygon && <> · Polygon Stack <span className="text-zinc-200 tabular">{formatUsd(polygon.supply)}</span></>}
        {tron && <> · Tron <span className="text-zinc-200 tabular">{formatUsd(tron.supply)}</span></>}
      </div>

      <Section title="Payments narrative shift">
        <p className="whitespace-pre-line text-zinc-200 leading-relaxed">{payload.narrative}</p>
      </Section>

      <Section title="Open Money Stack angle">
        <div className="rounded-2xl border border-violet-400/20 bg-violet-500/[0.06] p-5 text-zinc-200 leading-relaxed">
          {payload.openMoneyAngle}
        </div>
      </Section>

      <Section title="Rail movers · 7d">
        <ul className="space-y-3">
          {payload.movers.map((m) => (
            <li key={m.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{m.name}</span>
                <span className={`text-sm tabular ${changeColor(m.change7d)}`}>{formatPct(m.change7d)}</span>
              </div>
              <div className="mt-1 text-xs text-zinc-500 tabular">{formatUsd(m.supply)} stablecoin supply</div>
              <div className="mt-2 text-sm text-zinc-300 leading-relaxed">{m.reason}</div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Battlecards">
        <div className="space-y-3">
          {payload.battlecards.map((b, i) => (
            <Card key={i}>
              <div className="p-5">
                <div className="font-medium text-zinc-100">{b.question}</div>
                <div className="mt-2 text-sm text-zinc-300 leading-relaxed">{b.answer}</div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <div className="mt-12 rounded-2xl border border-white/5 bg-gradient-to-br from-violet-500/10 to-transparent p-6">
        <h3 className="font-semibold tracking-tight">Get this every Monday</h3>
        <p className="mt-1 text-sm text-zinc-400">Same briefing, in your inbox. Free.</p>
        <div className="mt-4">
          <SubscribeForm variant="inline" />
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xs font-medium tracking-[0.18em] text-zinc-500 uppercase mb-4">{title}</h2>
      {children}
    </section>
  );
}
