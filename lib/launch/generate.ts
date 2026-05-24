import { generateObject } from "ai";
import { z } from "zod";
import { createHash } from "node:crypto";
import { loadPositioningSource, loadPositioningSourceText, type PositioningSource, type ProductPositioning } from "./source";
import type {
  LaunchBundle,
  PlatformAssets,
  ProductAssets,
  AssetMeta,
} from "./types";

const MODEL = process.env.L2_INTEL_MODEL ?? "anthropic/claude-sonnet-4.6";

// Cost estimate per million tokens (input + output averaged). Sonnet 4.6 ~ $3 in / $15 out.
const COST_PER_M_INPUT = 3;
const COST_PER_M_OUTPUT = 15;

function estimateCost(prompt = 0, completion = 0): number {
  return (prompt / 1_000_000) * COST_PER_M_INPUT + (completion / 1_000_000) * COST_PER_M_OUTPUT;
}

function toneBlock(src: PositioningSource): string {
  return [
    `Voice traits: ${src.platform.tone.voice.join(", ") || "direct, evidence-based"}.`,
    src.platform.tone.forbidden_words.length
      ? `Forbidden words (never use): ${src.platform.tone.forbidden_words.join(", ")}.`
      : "",
    src.platform.tone.reference_voice ? `Reference voice: ${src.platform.tone.reference_voice}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

// ---------- Schemas (one per asset type) ----------

const onePagerSchema = z.object({
  headline: z.string().max(80),
  subheadline: z.string().max(180),
  problem: z.string().max(280),
  solution: z.string().max(320),
  features: z
    .array(z.object({ name: z.string().max(40), body: z.string().max(200) }))
    .min(3)
    .max(4),
  proof: z.array(z.string().max(160)).min(2).max(4),
  cta: z.object({ primary: z.string().max(40), secondary: z.string().max(40) }),
});

const landingBlockSchema = z.object({
  hero: z.object({
    headline: z.string().max(90),
    subheadline: z.string().max(200),
    ctaPrimary: z.string().max(28),
    ctaSecondary: z.string().max(28),
  }),
  features: z.array(z.object({ title: z.string().max(50), body: z.string().max(200) })).min(3).max(4),
  socialProof: z.string().max(280),
  faq: z.array(z.object({ question: z.string().max(140), answer: z.string().max(360) })).min(3).max(4),
});

const emailNurtureSchema = z.object({
  sequence: z
    .array(
      z.object({
        day: z.number().int().min(0).max(30),
        subject: z.string().max(80),
        preheader: z.string().max(120),
        body: z.string().min(120).max(900),
      }),
    )
    .length(5),
});

const linkedinAdsSchema = z.object({
  variants: z
    .array(
      z.object({
        angle: z.string().max(40),
        headline: z.string().max(140),
        intro: z.string().max(180),
        cta: z.string().max(28),
      }),
    )
    .length(10),
});

const battlecardSetSchema = z.object({
  cards: z
    .array(
      z.object({
        competitor: z.string(),
        short_take: z.string().max(220),
        why_we_win: z.string().max(280),
        where_they_win: z.string().max(220),
        objection_handling: z
          .array(z.object({ question: z.string().max(140), response: z.string().max(360) }))
          .min(2)
          .max(3),
      }),
    )
    .min(2)
    .max(3),
});

const bdTalkTrackSchema = z.object({
  opener: z.string().max(280),
  qualifying_questions: z.array(z.string().max(160)).min(4).max(6),
  talking_points: z.array(z.string().max(220)).min(4).max(6),
  common_objections: z
    .array(z.object({ objection: z.string().max(160), response: z.string().max(340) }))
    .min(3)
    .max(4),
  close: z.string().max(280),
});

const platformBundleSchema = z.object({
  master_narrative: z.string().min(200).max(1200),
  bundled_pitch: z.string().min(150).max(900),
  icp_to_product_map: z
    .array(
      z.object({
        icp_id: z.string(),
        recommended_products: z.array(z.string()).min(1),
        positioning: z.string().max(280),
      }),
    )
    .min(2),
  cross_product_table: z
    .array(
      z.object({
        product_id: z.string(),
        product_name: z.string(),
        primary_icp: z.string(),
        when_to_lead_with_it: z.string().max(160),
        primary_competitor: z.string().max(60),
      }),
    )
    .min(2),
});

// ---------- Generators ----------

async function generateWithMeta<T>(args: {
  schema: z.ZodSchema<T>;
  system: string;
  prompt: string;
}): Promise<{ object: T; meta: AssetMeta }> {
  const started = Date.now();
  const { object, usage } = await generateObject({
    model: MODEL,
    schema: args.schema,
    system: args.system,
    prompt: args.prompt,
  });
  const latencyMs = Date.now() - started;
  const promptTokens = usage?.inputTokens ?? 0;
  const completionTokens = usage?.outputTokens ?? 0;
  const totalTokens = usage?.totalTokens ?? promptTokens + completionTokens;
  return {
    object,
    meta: {
      generatedAt: new Date().toISOString(),
      model: MODEL,
      latencyMs,
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCostUsd: estimateCost(promptTokens, completionTokens),
    },
  };
}

function productContext(product: ProductPositioning, src: PositioningSource): string {
  return [
    `Platform: ${src.platform.name} — ${src.platform.one_liner}`,
    `Platform positioning: ${src.platform.positioning_statement.trim()}`,
    `Bundled value: ${src.platform.bundled_value_prop.trim()}`,
    "",
    `Product: ${product.name} (${product.category}, status ${product.status})`,
    `One-liner: ${product.one_liner}`,
    `Job-to-be-done: ${product.job_to_be_done.trim()}`,
    `ICPs (ids): ${product.icps.join(", ")}`,
    `Differentiators:\n- ${product.differentiators.join("\n- ")}`,
    `Competitors:\n${product.competitors.map((c) => `- ${c.name}: ${c.positioning_vs.trim()}`).join("\n")}`,
    `Proof points:\n- ${product.proof_points.join("\n- ")}`,
    product.primary_metric ? `Primary metric: ${product.primary_metric}` : "",
    "",
    toneBlock(src),
  ]
    .filter(Boolean)
    .join("\n");
}

async function generateProductAssets(
  product: ProductPositioning,
  src: PositioningSource,
): Promise<ProductAssets> {
  const ctx = productContext(product, src);
  const baseSystem = [
    `You are a senior product marketing writer working from a positioning source of truth.`,
    `Generate copy that could ship without editorial review. Be specific, concrete, and concise.`,
    `Never invent numbers, customers, or claims not present in the supplied context.`,
    `When a forbidden word is listed, do not use it under any inflection.`,
  ].join(" ");

  const [op, lb, en, ads, bc, tt] = await Promise.all([
    generateWithMeta({
      schema: onePagerSchema,
      system: baseSystem + " Output: a one-pager structured for a single product, ready to drop into a deck.",
      prompt: `Generate the one-pager for ${product.name}.\n\n${ctx}`,
    }),
    generateWithMeta({
      schema: landingBlockSchema,
      system: baseSystem + " Output: a landing-page block (hero, features, social proof, FAQ) for the product page.",
      prompt: `Generate the landing-page block for ${product.name}. Keep the hero headline benefit-led, not feature-led.\n\n${ctx}`,
    }),
    generateWithMeta({
      schema: emailNurtureSchema,
      system:
        baseSystem +
        " Output: a 5-message nurture sequence on days 0, 2, 4, 7, 10. Each message single-purpose, written as if from a PMM, plain-text-feel.",
      prompt: `Generate the 5-email nurture sequence for ${product.name}. Day 0 introduces, Day 2 dives into one differentiator, Day 4 surfaces a competitor angle, Day 7 a proof point or customer-shaped story, Day 10 the close.\n\n${ctx}`,
    }),
    generateWithMeta({
      schema: linkedinAdsSchema,
      system:
        baseSystem +
        " Output: 10 LinkedIn ad variants. Each variant covers a distinct angle (vs competitor, by ICP, by proof point, by JTBD, by category) — no near-duplicates.",
      prompt: `Generate 10 LinkedIn ad variants for ${product.name}. Each has a distinct angle. Headlines are punchy and benefit-led; intros add one concrete proof or differentiator; CTAs are 2-3 words.\n\n${ctx}`,
    }),
    generateWithMeta({
      schema: battlecardSetSchema,
      system:
        baseSystem +
        " Output: 2-3 battlecards vs the named competitors. Each card includes a short take, why we win, where they win (honest), and objection handling.",
      prompt: `Generate battlecards for ${product.name} vs its named competitors. Honest — name where they actually beat us. 'Why we win' must be defensible by the differentiators and proof points listed.\n\n${ctx}`,
    }),
    generateWithMeta({
      schema: bdTalkTrackSchema,
      system: baseSystem + " Output: a BD talk track — opener, qualifying questions, talking points, objections, close.",
      prompt: `Generate a BD talk track for ${product.name}. Qualifying questions surface which ICP segment the buyer is. Objection handling matches what BD actually hears.\n\n${ctx}`,
    }),
  ]);

  const totalLatency = Math.max(op.meta.latencyMs, lb.meta.latencyMs, en.meta.latencyMs, ads.meta.latencyMs, bc.meta.latencyMs, tt.meta.latencyMs);
  const totalTokens =
    (op.meta.totalTokens ?? 0) +
    (lb.meta.totalTokens ?? 0) +
    (en.meta.totalTokens ?? 0) +
    (ads.meta.totalTokens ?? 0) +
    (bc.meta.totalTokens ?? 0) +
    (tt.meta.totalTokens ?? 0);
  const totalCost =
    (op.meta.estimatedCostUsd ?? 0) +
    (lb.meta.estimatedCostUsd ?? 0) +
    (en.meta.estimatedCostUsd ?? 0) +
    (ads.meta.estimatedCostUsd ?? 0) +
    (bc.meta.estimatedCostUsd ?? 0) +
    (tt.meta.estimatedCostUsd ?? 0);

  return {
    productId: product.id,
    productName: product.name,
    one_pager: op.object,
    landing_block: lb.object,
    email_nurture: en.object,
    linkedin_ads: ads.object,
    battlecards: bc.object,
    bd_talk_track: tt.object,
    meta: {
      generatedAt: new Date().toISOString(),
      model: MODEL,
      latencyMs: totalLatency,
      promptTokens: undefined,
      completionTokens: undefined,
      totalTokens,
      estimatedCostUsd: totalCost,
    },
  };
}

async function generatePlatformAssets(src: PositioningSource): Promise<PlatformAssets> {
  const productSummaries = src.products
    .map(
      (p) => `- ${p.id} (${p.name}): ${p.one_liner} | ICPs: ${p.icps.join(",")} | top competitor: ${p.competitors[0]?.name}`,
    )
    .join("\n");

  const prompt = [
    `Platform: ${src.platform.name}`,
    `Category: ${src.platform.category}`,
    `One-liner: ${src.platform.one_liner}`,
    `Positioning statement: ${src.platform.positioning_statement.trim()}`,
    `Bundled value: ${src.platform.bundled_value_prop.trim()}`,
    "",
    "ICP segments:",
    src.platform.icp_segments.map((s) => `- ${s.id}: ${s.label} — ${s.description}`).join("\n"),
    "",
    "Products:",
    productSummaries,
    "",
    toneBlock(src),
  ].join("\n");

  const { object, meta } = await generateWithMeta({
    schema: platformBundleSchema,
    system: [
      "You are a senior PMM building the platform-level narrative for a multi-product B2B platform.",
      "Output four parts: a master narrative, a bundled pitch (why the stack > the parts), an ICP-to-product map, and a cross-product table.",
      "Reference only the products listed. Use product ids exactly as provided.",
    ].join(" "),
    prompt,
  });
  return { ...object, meta };
}

// ---------- Top-level ----------

export async function generateLaunchBundle(): Promise<LaunchBundle> {
  const src = loadPositioningSource();
  const { path, text } = loadPositioningSourceText();
  const sourceHash = createHash("sha256").update(text).digest("hex").slice(0, 12);

  const platform = await generatePlatformAssets(src);
  const products = await Promise.all(src.products.map((p) => generateProductAssets(p, src)));

  const totalLatencyMs = platform.meta.latencyMs + products.reduce((s, p) => s + p.meta.latencyMs, 0);
  const totalTokens = (platform.meta.totalTokens ?? 0) + products.reduce((s, p) => s + (p.meta.totalTokens ?? 0), 0);
  const totalCostUsd = (platform.meta.estimatedCostUsd ?? 0) + products.reduce((s, p) => s + (p.meta.estimatedCostUsd ?? 0), 0);
  const callCount = 1 + products.length * 6;

  return {
    generatedAt: new Date().toISOString(),
    sourcePath: path,
    sourceHash,
    platform,
    products,
    totals: { totalLatencyMs, totalTokens, totalCostUsd, callCount },
  };
}
