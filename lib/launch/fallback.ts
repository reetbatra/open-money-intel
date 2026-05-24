import { createHash } from "node:crypto";
import { loadPositioningSource, loadPositioningSourceText, type ProductPositioning } from "./source";
import type { LaunchBundle, ProductAssets, PlatformAssets, AssetMeta } from "./types";

const meta = (model = "fallback"): AssetMeta => ({
  generatedAt: new Date().toISOString(),
  model,
  latencyMs: 0,
  totalTokens: 0,
  estimatedCostUsd: 0,
});

function fallbackProduct(p: ProductPositioning): ProductAssets {
  return {
    productId: p.id,
    productName: p.name,
    one_pager: {
      headline: p.one_liner.slice(0, 80),
      subheadline: p.job_to_be_done.slice(0, 180),
      problem: "Buyers waste cycles wiring four vendors to do what one stack should.",
      solution: `${p.name} delivers ${p.category.toLowerCase()} as part of a single API surface — composable with the rest of the Polygon Stack.`,
      features: p.differentiators.slice(0, 3).map((d) => ({ name: d.split("—")[0]?.trim().slice(0, 40) || "Feature", body: d })),
      proof: p.proof_points.slice(0, 3),
      cta: { primary: "Get a demo", secondary: "Read the docs" },
    },
    landing_block: {
      hero: {
        headline: p.one_liner.slice(0, 90),
        subheadline: p.job_to_be_done.slice(0, 200),
        ctaPrimary: "Get started",
        ctaSecondary: "Talk to BD",
      },
      features: p.differentiators.slice(0, 3).map((d) => ({ title: d.split(".")[0].slice(0, 50), body: d })),
      socialProof: p.proof_points.join(" · "),
      faq: [
        { question: `What's ${p.name} actually for?`, answer: p.job_to_be_done },
        {
          question: `How is this different from ${p.competitors[0]?.name}?`,
          answer: p.competitors[0]?.positioning_vs ?? "Different surface area; talk to BD.",
        },
        { question: `Is it production-ready?`, answer: p.proof_points[0] ?? `${p.name} is in production.` },
      ],
    },
    email_nurture: {
      sequence: [0, 2, 4, 7, 10].map((day, i) => ({
        day,
        subject:
          [
            `Quick intro: ${p.name}`,
            `Why ${p.name} > ${p.competitors[0]?.name ?? "the alternative"}`,
            `One thing about ${p.name} most miss`,
            `${p.name} in production: what it looks like`,
            `Want to scope a deployment?`,
          ][i],
        preheader: `${p.one_liner}`,
        body:
          [
            `${p.name} solves ${p.job_to_be_done.toLowerCase()}. Reply if you want the 2-min version.`,
            `Most teams comparing us to ${p.competitors[0]?.name} focus on the wrong axis. The real difference: ${p.differentiators[0]}.`,
            `Quiet detail most miss: ${p.differentiators[1] ?? p.differentiators[0]}.`,
            `Live use case: ${p.proof_points[0] ?? "in production with named customers."} Want details under NDA?`,
            `If you want to scope a deployment, hit reply with your use case and we'll come back with a real plan in 24h.`,
          ][i],
      })),
    },
    linkedin_ads: {
      variants: [
        ...p.differentiators.slice(0, 3).map((d, i) => ({
          angle: `Differentiator ${i + 1}`,
          headline: d.split(".")[0],
          intro: d,
          cta: "Learn more",
        })),
        ...p.competitors.slice(0, 3).map((c) => ({
          angle: `vs ${c.name}`,
          headline: `${p.name} vs ${c.name}: read the honest take`,
          intro: c.positioning_vs.slice(0, 180),
          cta: "Read it",
        })),
        ...p.icps.slice(0, 2).map((i) => ({
          angle: `For ${i}`,
          headline: `${p.name} for ${i}: why teams switch`,
          intro: p.one_liner,
          cta: "See how",
        })),
        ...p.proof_points.slice(0, 2).map((pp, i) => ({
          angle: `Proof ${i + 1}`,
          headline: pp.split(".")[0].slice(0, 140),
          intro: pp,
          cta: "Read the case",
        })),
      ].slice(0, 10),
    },
    battlecards: {
      cards: p.competitors.slice(0, 3).map((c) => ({
        competitor: c.name,
        short_take: c.positioning_vs.slice(0, 220),
        why_we_win: p.differentiators.slice(0, 2).join(" "),
        where_they_win: `${c.name} has a more entrenched footprint in their primary use case; concede that and reframe the buyer's job.`,
        objection_handling: [
          {
            question: `Why not just use ${c.name}?`,
            response: c.positioning_vs,
          },
          {
            question: `Is ${p.name} production-ready?`,
            response: p.proof_points[0] ?? `${p.name} is in production with paying customers.`,
          },
        ],
      })),
    },
    bd_talk_track: {
      opener: `${p.name} is the part of the Polygon Open Money Stack that ${p.one_liner.toLowerCase()}. Where in your roadmap does ${p.category.toLowerCase()} sit today?`,
      qualifying_questions: [
        "What does your money-movement architecture look like today?",
        "Which segments — fintech, PSP, enterprise issuer, consumer app — describe your business?",
        `Are you actively comparing us to ${p.competitors[0]?.name}?`,
        "Is compliance and regulatory finality a hard requirement in your stack?",
      ],
      talking_points: p.differentiators,
      common_objections: p.competitors.slice(0, 3).map((c) => ({
        objection: `We're already evaluating ${c.name}.`,
        response: c.positioning_vs,
      })),
      close: `If we set up a working session next week to map your money-movement flow against ${p.name}, would that be useful? I can bring an engineer.`,
    },
    meta: meta("fallback"),
  };
}

function fallbackPlatform(src: ReturnType<typeof loadPositioningSource>): PlatformAssets {
  return {
    master_narrative: src.platform.positioning_statement,
    bundled_pitch: src.platform.bundled_value_prop,
    icp_to_product_map: src.platform.icp_segments.map((s) => {
      const recommended = src.products.filter((p) => p.icps.includes(s.id)).map((p) => p.id);
      return {
        icp_id: s.id,
        recommended_products: recommended.length ? recommended : [src.products[0].id],
        positioning: `For ${s.label.toLowerCase()}, lead with ${recommended[0] ?? src.products[0].id}. The rest of the stack composes in over the deployment lifecycle.`,
      };
    }),
    cross_product_table: src.products.map((p) => ({
      product_id: p.id,
      product_name: p.name,
      primary_icp: p.icps[0],
      when_to_lead_with_it: p.one_liner.slice(0, 160),
      primary_competitor: p.competitors[0]?.name ?? "—",
    })),
    meta: meta("fallback"),
  };
}

export function buildFallbackBundle(): LaunchBundle {
  const src = loadPositioningSource();
  const { path, text } = loadPositioningSourceText();
  const sourceHash = createHash("sha256").update(text).digest("hex").slice(0, 12);
  return {
    generatedAt: new Date().toISOString(),
    sourcePath: path,
    sourceHash,
    platform: fallbackPlatform(src),
    products: src.products.map(fallbackProduct),
    totals: { totalLatencyMs: 0, totalTokens: 0, totalCostUsd: 0, callCount: 0 },
  };
}
