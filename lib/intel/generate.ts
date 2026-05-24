import { generateObject } from "ai";
import { z } from "zod";
import { loadDashboardData, topRailMovers } from "@/lib/data";
import type { DigestPayload, PaymentRailId } from "@/lib/types";
import type { PaymentRailSnapshot } from "@/lib/data/payments";

const briefingSchema = z.object({
  narrative: z
    .string()
    .min(140)
    .max(1000)
    .describe(
      "2-3 paragraphs on the dominant payments-narrative shift this week. Specific to the supplied data. No buzzwords, no 'paradigm shift', no 'unlocks'.",
    ),
  openMoneyAngle: z
    .string()
    .min(140)
    .max(700)
    .describe(
      "One paragraph: how this week's stablecoin-rail data affects Polygon Open Money Stack positioning. Written for Polygon PMM. Honest about where Polygon is losing, not just where it's winning.",
    ),
  moverReasons: z
    .array(
      z.object({
        id: z.string(),
        reason: z
          .string()
          .max(180)
          .describe("One-line empirical reason for the 7d supply shift on this rail. Tie to a real catalyst when possible."),
      }),
    )
    .max(8),
  battlecards: z
    .array(
      z.object({
        question: z.string().max(160),
        answer: z.string().min(60).max(420),
      }),
    )
    .min(3)
    .max(4)
    .describe(
      "Buyer/dev objections that surface in conversations with fintechs, PSPs, and neobanks evaluating Polygon vs Tron / Circle / Solana Pay / Base / Stripe-Bridge / TON. Polygon-positive but evidence-based.",
    ),
});

const MODEL = process.env.L2_INTEL_MODEL ?? "anthropic/claude-sonnet-4.6";

function compactRails(rails: PaymentRailSnapshot[]) {
  return rails.map((r) => ({
    id: r.id,
    name: r.name,
    isPolygonStack: r.isPolygonStack,
    stablecoinSupply: Math.round(r.stablecoinSupply),
    change7d: r.change7d,
    change30d: r.change30d,
    chains: r.chains,
  }));
}

export async function generateBriefing(): Promise<DigestPayload> {
  const data = await loadDashboardData();
  const movers = topRailMovers(data.rails, 8);
  const lastTs = data.stablecoinHistory.at(-1)?.timestamp ?? Date.now();
  const rangeEnd = new Date(lastTs);
  const rangeStart = new Date(lastTs - 7 * 24 * 60 * 60 * 1000);
  const totalSupply =
    data.stablecoinHistory.at(-1)?.supply ?? data.rails.reduce((s, r) => s + r.stablecoinSupply, 0);

  let aiResult: z.infer<typeof briefingSchema>;
  try {
    const { object } = await generateObject({
      model: MODEL,
      schema: briefingSchema,
      system: [
        "You are a competitive-intelligence analyst writing for the Polygon Open Money Stack PMM team.",
        "Voice: dry, specific, evidence-based, willing to call out where Polygon is behind. No hype, no buzzwords, no 'unlocks' or 'paradigm shifts'.",
        "Treat the supplied JSON as ground truth. Only reference rails and movements present in it. Never invent numbers or events.",
        "Polygon's positioning thesis: stack-agnostic, API-driven money movement; PoS for liquidity depth; AggLayer for cross-chain unification; CDK for issuer chains.",
        "Honesty test: a Polygon PMM should be able to walk into a buyer meeting having read this and not be blindsided. Surface inconvenient truths.",
      ].join(" "),
      prompt: [
        `Week: ${rangeStart.toISOString()} → ${rangeEnd.toISOString()}.`,
        `Total onchain stablecoin supply: $${Math.round(totalSupply).toLocaleString()}.`,
        "",
        "Payment rails (supply USD, change as decimal fraction):",
        JSON.stringify(compactRails(data.rails), null, 2),
        "",
        "Top movers (largest |change7d| over $100M supply):",
        JSON.stringify(compactRails(movers), null, 2),
        "",
        "Produce: (1) payments-narrative shift, (2) Open Money Stack angle, (3) one-line reason per mover id, (4) 3-4 battlecards for objections a fintech/PSP/neobank might raise this week.",
      ].join("\n"),
    });
    aiResult = object;
  } catch (err) {
    console.warn("AI generation failed, using deterministic fallback:", err);
    aiResult = deterministicFallback(data.rails, movers, totalSupply);
  }

  const moverMap = new Map(aiResult.moverReasons.map((m) => [m.id, m.reason]));

  return {
    generatedAt: new Date().toISOString(),
    rangeStart: rangeStart.toISOString(),
    rangeEnd: rangeEnd.toISOString(),
    totalStablecoinSupply: totalSupply,
    railComparison: data.rails.map((r) => ({
      id: r.id,
      name: r.name,
      supply: r.stablecoinSupply,
      change7d: r.change7d,
      isPolygonStack: r.isPolygonStack,
    })),
    stablecoinTrend: data.stablecoinHistory.slice(-30),
    narrative: aiResult.narrative,
    openMoneyAngle: aiResult.openMoneyAngle,
    battlecards: aiResult.battlecards,
    movers: movers.map((m) => ({
      id: m.id,
      name: m.name,
      change7d: m.change7d ?? 0,
      supply: m.stablecoinSupply,
      reason: moverMap.get(m.id) ?? "Material 7-day supply shift; underlying cause not annotated.",
    })),
  };
}

function deterministicFallback(
  rails: PaymentRailSnapshot[],
  movers: PaymentRailSnapshot[],
  totalSupply: number,
): z.infer<typeof briefingSchema> {
  const polygon = rails.find((r) => r.id === "polygon-stack");
  const tron = rails.find((r) => r.id === "tron");
  const supplyB = (n: number | undefined | null) => `$${Math.round((n ?? 0) / 1e9 * 10) / 10}B`;
  return {
    narrative:
      `Onchain stablecoin supply sits at ${supplyB(totalSupply)} across tracked rails. Tron continues to dominate the dollar-rail conversation in raw supply at ${supplyB(tron?.stablecoinSupply)}, an order of magnitude larger than the Polygon Stack's ${supplyB(polygon?.stablecoinSupply)}. The 7d movers are ${movers.slice(0, 3).map((m) => m.name).join(", ") || "muted this week"}. AI annotation unavailable for this digest — this fallback is structural only and the full narrative ships when the AI key is configured.`,
    openMoneyAngle:
      `The Polygon Stack is currently ranked by raw supply, not by velocity. The honest read this week: Polygon at ${supplyB(polygon?.stablecoinSupply)} is a top-3 EVM stablecoin home but a fractional player vs Tron in raw scale. The positioning wedge isn't 'beat Tron on supply' — it's 'be the stack a regulated PSP can build on'. Lean into compliance, CDK programmability, and AggLayer-based settlement guarantees.`,
    moverReasons: movers.map((m) => ({
      id: m.id,
      reason: `${(m.change7d ?? 0) > 0 ? "Up" : "Down"} ${Math.abs((m.change7d ?? 0) * 100).toFixed(1)}% on the week; root cause not annotated in fallback mode.`,
    })),
    battlecards: [
      {
        question: "Why Polygon over Tron for stablecoin payments?",
        answer:
          "Tron wins raw volume in remittance corridors via low fees and entrenched liquidity. Polygon wins regulated-fintech use cases: a programmable EVM, working compliance integrations, AggLayer for cross-chain settlement, and CDK if you need a sovereign issuer chain. Pick Tron if you optimize for $0.001-per-tx P2P; pick Polygon if your buyer is a PSP, neobank, or issuer that needs an actual API surface.",
      },
      {
        question: "Why Polygon over Circle/CCTP for moving USDC across chains?",
        answer:
          "Circle/CCTP is the issuer's burn-mint transport — purpose-built for USDC only. AggLayer is multi-asset, multi-stack, settling across heterogeneous chains with shared accounting. If you're USDC-only and don't need other tokens to move with you, CCTP is fine. If you need a single primitive for USDC + native stables + tokenized RWAs + non-Circle dollars, AggLayer is the abstraction.",
      },
      {
        question: "Isn't Solana Pay just faster and cheaper?",
        answer:
          "On a single-chain micro-transaction, yes. The Polygon Stack isn't competing on the single-chain micro-transaction; it's competing on the platform abstraction for fintechs that need EVM tooling, multi-chain liquidity, and a deployable sovereign chain. The relevant question for the buyer is whether they're building one app or a platform.",
      },
    ],
  };
}
