"use client";

import { useState } from "react";
import type { ProductAssets } from "@/lib/launch/types";
import { CopyBlock } from "./copy-block";

type AssetTab = "one_pager" | "landing_block" | "email_nurture" | "linkedin_ads" | "battlecards" | "bd_talk_track";

const TABS: Array<{ id: AssetTab; label: string }> = [
  { id: "one_pager", label: "One-pager" },
  { id: "landing_block", label: "Landing page" },
  { id: "email_nurture", label: "Email nurture" },
  { id: "linkedin_ads", label: "LinkedIn ads" },
  { id: "battlecards", label: "Battlecards" },
  { id: "bd_talk_track", label: "BD talk track" },
];

export function ProductAssetsView({ assets }: { assets: ProductAssets }) {
  const [active, setActive] = useState<AssetTab>("one_pager");

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-5 border-b border-white/5 pb-3">
        {TABS.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                isActive ? "bg-white text-black" : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {active === "one_pager" && <OnePagerView a={assets.one_pager} />}
      {active === "landing_block" && <LandingBlockView a={assets.landing_block} />}
      {active === "email_nurture" && <EmailNurtureView a={assets.email_nurture} />}
      {active === "linkedin_ads" && <LinkedInAdsView a={assets.linkedin_ads} />}
      {active === "battlecards" && <BattlecardsView a={assets.battlecards} />}
      {active === "bd_talk_track" && <BdTalkTrackView a={assets.bd_talk_track} />}
    </div>
  );
}

function Section({ title, children, copyText }: { title: string; children: React.ReactNode; copyText?: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs uppercase tracking-[0.16em] text-zinc-500">{title}</h4>
        {copyText && <CopyBlock text={copyText} />}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function OnePagerView({ a }: { a: ProductAssets["one_pager"] }) {
  const copyAll = [
    `# ${a.headline}`,
    `## ${a.subheadline}`,
    "",
    `**Problem.** ${a.problem}`,
    `**Solution.** ${a.solution}`,
    "",
    `### Features`,
    ...a.features.map((f) => `- **${f.name}.** ${f.body}`),
    "",
    `### Proof`,
    ...a.proof.map((p) => `- ${p}`),
    "",
    `CTA: ${a.cta.primary} / ${a.cta.secondary}`,
  ].join("\n");

  return (
    <div className="space-y-4">
      <Section title="Hero" copyText={`${a.headline}\n${a.subheadline}`}>
        <h2 className="text-2xl font-semibold tracking-tight">{a.headline}</h2>
        <p className="mt-2 text-zinc-300">{a.subheadline}</p>
      </Section>
      <div className="grid md:grid-cols-2 gap-4">
        <Section title="Problem" copyText={a.problem}>
          <p className="text-zinc-300 leading-relaxed">{a.problem}</p>
        </Section>
        <Section title="Solution" copyText={a.solution}>
          <p className="text-zinc-300 leading-relaxed">{a.solution}</p>
        </Section>
      </div>
      <Section title="Features" copyText={a.features.map((f) => `${f.name}: ${f.body}`).join("\n")}>
        <ul className="grid md:grid-cols-2 gap-3">
          {a.features.map((f) => (
            <li key={f.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className="font-medium text-zinc-100">{f.name}</div>
              <div className="mt-1 text-zinc-400 text-xs leading-relaxed">{f.body}</div>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Proof points" copyText={a.proof.join("\n")}>
        <ul className="space-y-1 text-zinc-300">
          {a.proof.map((p, i) => (
            <li key={i}>· {p}</li>
          ))}
        </ul>
      </Section>
      <Section title="CTA">
        <div className="flex gap-2">
          <span className="rounded-full bg-violet-500 text-white px-4 py-1.5 text-xs font-medium">{a.cta.primary}</span>
          <span className="rounded-full border border-white/15 px-4 py-1.5 text-xs">{a.cta.secondary}</span>
        </div>
      </Section>
      <div className="flex justify-end">
        <CopyBlock text={copyAll} label="Copy full one-pager (markdown)" />
      </div>
    </div>
  );
}

function LandingBlockView({ a }: { a: ProductAssets["landing_block"] }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/15 to-transparent p-8">
        <h2 className="text-4xl font-semibold tracking-tight leading-tight">{a.hero.headline}</h2>
        <p className="mt-3 text-zinc-300 max-w-2xl">{a.hero.subheadline}</p>
        <div className="mt-5 flex gap-2">
          <span className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-medium">{a.hero.ctaPrimary}</span>
          <span className="rounded-full border border-white/15 px-4 py-2 text-sm">{a.hero.ctaSecondary}</span>
        </div>
        <div className="mt-4">
          <CopyBlock text={`${a.hero.headline}\n${a.hero.subheadline}\nCTA: ${a.hero.ctaPrimary} / ${a.hero.ctaSecondary}`} />
        </div>
      </div>

      <Section title="Features" copyText={a.features.map((f) => `${f.title}: ${f.body}`).join("\n")}>
        <ul className="grid md:grid-cols-3 gap-3">
          {a.features.map((f) => (
            <li key={f.title} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className="font-medium text-zinc-100">{f.title}</div>
              <div className="mt-1 text-zinc-400 text-xs leading-relaxed">{f.body}</div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Social proof" copyText={a.socialProof}>
        <p className="italic text-zinc-300">&ldquo;{a.socialProof}&rdquo;</p>
      </Section>

      <Section title="FAQ" copyText={a.faq.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}>
        <ul className="space-y-3">
          {a.faq.map((f, i) => (
            <li key={i}>
              <div className="font-medium text-zinc-200">{f.question}</div>
              <div className="mt-1 text-sm text-zinc-400 leading-relaxed">{f.answer}</div>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function EmailNurtureView({ a }: { a: ProductAssets["email_nurture"] }) {
  return (
    <div className="space-y-4">
      {a.sequence.map((m, i) => {
        const copyText = `Day ${m.day}\nSubject: ${m.subject}\nPreheader: ${m.preheader}\n\n${m.body}`;
        return (
          <Section key={i} title={`Day ${m.day} · ${m.subject}`} copyText={copyText}>
            <div className="text-[11px] text-zinc-500 mb-2">{m.preheader}</div>
            <p className="whitespace-pre-line text-zinc-300 leading-relaxed">{m.body}</p>
          </Section>
        );
      })}
    </div>
  );
}

function LinkedInAdsView({ a }: { a: ProductAssets["linkedin_ads"] }) {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {a.variants.map((v, i) => {
        const copyText = `${v.headline}\n${v.intro}\nCTA: ${v.cta}`;
        return (
          <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-violet-300">{v.angle}</span>
              <CopyBlock text={copyText} />
            </div>
            <div className="mt-2 font-medium text-zinc-100 leading-snug">{v.headline}</div>
            <div className="mt-1 text-sm text-zinc-400 leading-relaxed">{v.intro}</div>
            <div className="mt-3 inline-flex items-center text-xs text-violet-300">{v.cta} →</div>
          </div>
        );
      })}
    </div>
  );
}

function BattlecardsView({ a }: { a: ProductAssets["battlecards"] }) {
  return (
    <div className="space-y-4">
      {a.cards.map((c, i) => {
        const copyText = [
          `vs ${c.competitor}`,
          ``,
          `Short take: ${c.short_take}`,
          `Why we win: ${c.why_we_win}`,
          `Where they win: ${c.where_they_win}`,
          ``,
          ...c.objection_handling.map((o) => `Q: ${o.question}\nA: ${o.response}`),
        ].join("\n");
        return (
          <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold tracking-tight">vs {c.competitor}</h4>
              <CopyBlock text={copyText} />
            </div>
            <p className="text-zinc-300 leading-relaxed text-sm">{c.short_take}</p>
            <div className="mt-3 grid md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-emerald-400/15 bg-emerald-500/[0.04] p-3">
                <div className="text-[10px] uppercase tracking-wider text-emerald-300">Why we win</div>
                <div className="mt-1 text-sm text-zinc-200 leading-relaxed">{c.why_we_win}</div>
              </div>
              <div className="rounded-xl border border-rose-400/15 bg-rose-500/[0.04] p-3">
                <div className="text-[10px] uppercase tracking-wider text-rose-300">Where they win</div>
                <div className="mt-1 text-sm text-zinc-200 leading-relaxed">{c.where_they_win}</div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {c.objection_handling.map((o, j) => (
                <div key={j}>
                  <div className="text-xs font-medium text-zinc-300">Q: {o.question}</div>
                  <div className="text-xs text-zinc-400 mt-0.5 leading-relaxed">A: {o.response}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BdTalkTrackView({ a }: { a: ProductAssets["bd_talk_track"] }) {
  const fullCopy = [
    `Opener: ${a.opener}`,
    ``,
    `Qualifying questions:`,
    ...a.qualifying_questions.map((q) => `- ${q}`),
    ``,
    `Talking points:`,
    ...a.talking_points.map((p) => `- ${p}`),
    ``,
    `Objections:`,
    ...a.common_objections.map((o) => `- ${o.objection}\n  → ${o.response}`),
    ``,
    `Close: ${a.close}`,
  ].join("\n");
  return (
    <div className="space-y-4">
      <Section title="Opener" copyText={a.opener}>
        <p className="text-zinc-300 leading-relaxed">{a.opener}</p>
      </Section>
      <Section title="Qualifying questions" copyText={a.qualifying_questions.join("\n")}>
        <ol className="space-y-1.5 text-zinc-300 list-decimal list-inside">
          {a.qualifying_questions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ol>
      </Section>
      <Section title="Talking points" copyText={a.talking_points.join("\n")}>
        <ul className="space-y-1.5 text-zinc-300">
          {a.talking_points.map((p, i) => (
            <li key={i}>· {p}</li>
          ))}
        </ul>
      </Section>
      <Section title="Common objections" copyText={a.common_objections.map((o) => `Q: ${o.objection}\nA: ${o.response}`).join("\n\n")}>
        <ul className="space-y-3">
          {a.common_objections.map((o, i) => (
            <li key={i}>
              <div className="text-sm font-medium text-zinc-200">Objection: {o.objection}</div>
              <div className="text-xs text-zinc-400 mt-0.5 leading-relaxed">Response: {o.response}</div>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Close" copyText={a.close}>
        <p className="text-zinc-300 leading-relaxed">{a.close}</p>
      </Section>
      <div className="flex justify-end">
        <CopyBlock text={fullCopy} label="Copy full talk track" />
      </div>
    </div>
  );
}
