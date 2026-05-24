import { createHash } from "node:crypto";
import type { LaunchBundle } from "@/lib/launch/types";
import { loadPositioningSource, type PositioningSource } from "@/lib/launch/source";

// Seeded PRNG. xmur3 + mulberry32. Deterministic so /telemetry numbers
// don't drift between renders for the same source hash + asset id.
function seededRng(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let state = h >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function gauss(rng: () => number, mean: number, stdev: number): number {
  // Box-Muller — gives a more believable distribution than uniform for engagement metrics.
  const u = 1 - rng();
  const v = rng();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return Math.max(0, mean + z * stdev);
}

export type Channel = "linkedin_ads" | "landing_block" | "email_nurture" | "one_pager" | "battlecards" | "bd_talk_track";

export interface AssetTelemetry {
  productId: string;
  productName: string;
  asset: Channel;
  label: string;
  impressions: number;
  engaged: number;
  converted: number;
  ctr: number;
  conversionRate: number;
  costUsd: number;
  cplUsd: number;
  topPerformer?: string;
}

export interface ProductTelemetry {
  productId: string;
  productName: string;
  rows: AssetTelemetry[];
  totals: {
    impressions: number;
    engaged: number;
    converted: number;
    spendUsd: number;
    cplUsd: number;
  };
}

export interface TelemetryInsight {
  productId: string;
  asset: Channel;
  finding: string;
  suggestedYamlEdit: string;
}

export interface TelemetryReport {
  sourceId: string;
  sourceLabel: string;
  sourceHash: string;
  generatedAt: string;
  windowDays: number;
  perProduct: ProductTelemetry[];
  totals: ProductTelemetry["totals"];
  insights: TelemetryInsight[];
}

// Channel performance characteristics — different funnels have different shapes.
// These are reasonable B2B fintech benchmarks; values get jittered per-asset.
const CHANNEL_PROFILE: Record<Channel, { baseImpressions: number; ctrMean: number; ctrSd: number; convRateMean: number; convRateSd: number; cpmUsd: number }> = {
  linkedin_ads: { baseImpressions: 42000, ctrMean: 0.018, ctrSd: 0.006, convRateMean: 0.06, convRateSd: 0.02, cpmUsd: 18 },
  landing_block: { baseImpressions: 8800, ctrMean: 0.21, ctrSd: 0.06, convRateMean: 0.08, convRateSd: 0.025, cpmUsd: 4 },
  email_nurture: { baseImpressions: 2400, ctrMean: 0.32, ctrSd: 0.08, convRateMean: 0.12, convRateSd: 0.03, cpmUsd: 0 },
  one_pager: { baseImpressions: 1200, ctrMean: 0.42, ctrSd: 0.1, convRateMean: 0.14, convRateSd: 0.04, cpmUsd: 0 },
  battlecards: { baseImpressions: 380, ctrMean: 0.55, ctrSd: 0.1, convRateMean: 0.18, convRateSd: 0.04, cpmUsd: 0 },
  bd_talk_track: { baseImpressions: 180, ctrMean: 0.62, ctrSd: 0.1, convRateMean: 0.21, convRateSd: 0.05, cpmUsd: 0 },
};

const CHANNEL_LABEL: Record<Channel, string> = {
  linkedin_ads: "LinkedIn ads",
  landing_block: "Landing page",
  email_nurture: "Email nurture",
  one_pager: "One-pager (asset views)",
  battlecards: "Battlecards (BD opens)",
  bd_talk_track: "BD talk track (calls used)",
};

function generateAssetRow(
  rng: () => number,
  asset: Channel,
  productId: string,
  productName: string,
  topPerformer?: string,
): AssetTelemetry {
  const profile = CHANNEL_PROFILE[asset];
  const impressions = Math.round(profile.baseImpressions * (0.6 + rng() * 0.9));
  const ctr = Math.max(0.002, gauss(rng, profile.ctrMean, profile.ctrSd));
  const engaged = Math.round(impressions * ctr);
  const conversionRate = Math.max(0.005, gauss(rng, profile.convRateMean, profile.convRateSd));
  const converted = Math.round(engaged * conversionRate);
  const costUsd = (impressions / 1000) * profile.cpmUsd;
  const cplUsd = converted === 0 ? 0 : costUsd / converted;
  return {
    productId,
    productName,
    asset,
    label: CHANNEL_LABEL[asset],
    impressions,
    engaged,
    converted,
    ctr,
    conversionRate,
    costUsd,
    cplUsd,
    topPerformer,
  };
}

function pickAdAngle(rng: () => number, bundle: LaunchBundle, productId: string): string | undefined {
  const product = bundle.products.find((p) => p.productId === productId);
  const variants = product?.linkedin_ads.variants;
  if (!variants || variants.length === 0) return undefined;
  return pick(rng, variants).angle;
}

function pickFaq(rng: () => number, bundle: LaunchBundle, productId: string): string | undefined {
  const product = bundle.products.find((p) => p.productId === productId);
  const faq = product?.landing_block.faq;
  if (!faq || faq.length === 0) return undefined;
  return pick(rng, faq).question;
}

function buildInsight(
  rng: () => number,
  bundle: LaunchBundle,
  src: PositioningSource,
  product: ProductTelemetry,
): TelemetryInsight | null {
  // Pick the worst-CPL row that has a CPL and produce a YAML-targeted suggestion.
  const candidates = product.rows.filter((r) => r.costUsd > 0 && r.converted > 0);
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.cplUsd - a.cplUsd);
  const worst = candidates[0];
  const productSrc = src.products.find((p) => p.id === product.productId);
  if (!productSrc) return null;

  if (worst.asset === "linkedin_ads") {
    const angle = pickAdAngle(rng, bundle, product.productId);
    return {
      productId: product.productId,
      asset: "linkedin_ads",
      finding: `LinkedIn CPL is $${worst.cplUsd.toFixed(0)} — the "${angle ?? "competitor"}" angle underperforms vs proof-point angles.`,
      suggestedYamlEdit: `Edit products[id=${product.productId}].proof_points — promote the highest-CTR proof to position 1. Regenerate ads; the new variants prefer position 1 proof in the "Proof" angles.`,
    };
  }
  if (worst.asset === "landing_block") {
    const faq = pickFaq(rng, bundle, product.productId);
    return {
      productId: product.productId,
      asset: "landing_block",
      finding: `Landing conversion at ${(worst.conversionRate * 100).toFixed(1)}% — the FAQ "${faq ?? "production-readiness"}" is the most-clicked element, suggesting buyers fixate on it.`,
      suggestedYamlEdit: `Move that answer up into products[id=${product.productId}].differentiators so the hero block addresses it inline.`,
    };
  }
  return {
    productId: product.productId,
    asset: worst.asset,
    finding: `${worst.label} converts at ${(worst.conversionRate * 100).toFixed(1)}% — bottom-quartile for this asset.`,
    suggestedYamlEdit: `Tighten products[id=${product.productId}].${worst.asset === "battlecards" ? "competitors[].positioning_vs" : "differentiators"} — current copy reads abstract.`,
  };
}

export function generateTelemetryReport(bundle: LaunchBundle, windowDays = 14): TelemetryReport {
  const src = loadPositioningSource(bundle.sourceId);
  const rng = seededRng(`${bundle.sourceHash}:${windowDays}`);

  const channels: Channel[] = ["linkedin_ads", "landing_block", "email_nurture", "one_pager", "battlecards", "bd_talk_track"];

  const perProduct: ProductTelemetry[] = bundle.products.map((p) => {
    const rows = channels.map((ch) => generateAssetRow(rng, ch, p.productId, p.productName, pickAdAngle(rng, bundle, p.productId)));
    const totals = rows.reduce(
      (acc, r) => ({
        impressions: acc.impressions + r.impressions,
        engaged: acc.engaged + r.engaged,
        converted: acc.converted + r.converted,
        spendUsd: acc.spendUsd + r.costUsd,
        cplUsd: 0,
      }),
      { impressions: 0, engaged: 0, converted: 0, spendUsd: 0, cplUsd: 0 },
    );
    totals.cplUsd = totals.converted === 0 ? 0 : totals.spendUsd / totals.converted;
    return { productId: p.productId, productName: p.productName, rows, totals };
  });

  const totals = perProduct.reduce(
    (acc, p) => ({
      impressions: acc.impressions + p.totals.impressions,
      engaged: acc.engaged + p.totals.engaged,
      converted: acc.converted + p.totals.converted,
      spendUsd: acc.spendUsd + p.totals.spendUsd,
      cplUsd: 0,
    }),
    { impressions: 0, engaged: 0, converted: 0, spendUsd: 0, cplUsd: 0 },
  );
  totals.cplUsd = totals.converted === 0 ? 0 : totals.spendUsd / totals.converted;

  const insights = perProduct
    .map((p) => buildInsight(rng, bundle, src, p))
    .filter((x): x is TelemetryInsight => x !== null);

  return {
    sourceId: bundle.sourceId,
    sourceLabel: bundle.sourceLabel,
    sourceHash: bundle.sourceHash,
    generatedAt: new Date().toISOString(),
    windowDays,
    perProduct,
    totals,
    insights,
  };
}

export function telemetryStableHash(bundle: LaunchBundle): string {
  return createHash("sha256").update(`${bundle.sourceHash}:${bundle.products.length}`).digest("hex").slice(0, 8);
}
