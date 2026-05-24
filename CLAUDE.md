@AGENTS.md

# Open Money Intel — project context

This codebase is a working demo for the **Polygon Labs Product Marketing Manager role** (Ashby ID `897b111d-f8ae-4759-a58e-75238ec8196d`). Built fast over a short session. Treat it as a polished prototype, not a long-lived production codebase.

The role's JD is the requirements spec — keep it pinned mentally:
- Polygon is mid-pivot from "L2 scaling" to "Open Money Stack" (API-driven money movement, blockchain settlement).
- The JD asks for AI systems fluency, not Claude-chat fluency — workflows that run without the human.
- The JD literally describes Launch in a Box: "compress full launch asset sets from a single positioning source of truth: one-pagers, landing page variants, email sequences, ad copy, BD talk tracks generated in a single pass."

## Architecture in one breath

Two loops, one source of truth.

**Loop 1 — Monitoring.** DefiLlama Stablecoins + L2Beat → `lib/data/payments.ts` normalizes 7 payment rails → `/rails`, `/`, weekly cron → `lib/intel/generate.ts` produces a Zod-validated briefing → Resend dispatches.

**Loop 2 — Launch pipeline.** `positioning/open-money-stack.yml` → `lib/launch/source.ts` parses + Zod-validates → `lib/launch/generate.ts` runs 6 parallel `generateObject` calls per product + 1 platform-level call → `LaunchBundle` is rendered in `/launch` with copy/regenerate/observability.

`/how-it-works` is the explainer page with an inline SVG diagram — also doubles as the spine for the user's Loom walkthrough.

## Key design choices (do not undo)

1. **Stablecoin supply is the unit of comparison, not TVS or TVL.** Honesty over Polygon-favorable framing. Tron is bigger than the Polygon Stack and the dashboard says so. A PMM that hides the truth will fail the JD's "honest" requirement.
2. **Zod schemas on every AI boundary.** Never parse free-form text. Every AI call returns a typed object; schema violations surface as errors, not silent drift.
3. **Deterministic fallback for every AI path.** When `AI_GATEWAY_API_KEY` is unset, both the briefing and Launch in a Box fall back to hand-written templates that still produce shippable output. The demo must work offline.
4. **Voice rules are baked into the positioning YAML, not the prompts.** See `positioning/open-money-stack.yml` → `platform.tone`. Forbidden words list is enforced via system prompt. Reference voice: Stripe docs meets Cloudflare blog.
5. **In-memory fallback for the DB layer** lives on `globalThis` so it survives module reloads in Next.js dev — see `lib/db/client.ts`. Without this, the briefing page can't read what the cron just wrote.
6. **L2 view kept but demoted** at `/dashboard`. Polygon's old narrative still moves liquidity, but the page header explicitly calls itself secondary. Demonstrates the user understands the pivot rather than ignoring the old work.

## Files map

```
app/
  api/
    cron/weekly/      → Monday cron: regen briefing + email subscribers
    launch/generate/  → trigger Launch in a Box generation
    subscribe/        → email signup
    health/           → config probe
  rails/              → full payment-rail comparison
  launch/             → Launch in a Box viewer (tabs, observability)
  briefing/           → latest weekly digest
  how-it-works/       → architecture page with SVG diagram
  dashboard/          → L2 legacy view (secondary)

lib/
  data/
    payments.ts       → fetch + normalize stablecoin supply per rail
    payment-rails.ts  → 7 curated rails (Polygon Stack + 6 competitors)
    l2beat.ts         → L2 data (used by legacy /dashboard)
    defillama.ts      → chain TVL (mostly legacy)
    ecosystems.ts     → L2 ecosystem membership (legacy)
  intel/generate.ts   → weekly briefing generator
  launch/
    source.ts         → positioning YAML schema + parser
    generate.ts       → 6-call-per-product asset pipeline
    fallback.ts       → deterministic template fallback
    store.ts          → in-memory bundle cache
    types.ts          → bundle types
  email/              → Resend integration + HTML template
  db/                 → Drizzle schema + Neon client (in-memory fallback)

positioning/
  open-money-stack.yml  ← edit this to change every downstream asset

components/
  launch/             → all Launch in a Box UI
  charts/             → recharts wrappers (client-only mounted)
  data/               → table + card primitives
  ui/                 → card, badge, stat
```

## What to read first if you're picking this up

1. `README.md` for setup.
2. `positioning/open-money-stack.yml` to understand the source-of-truth pattern.
3. `lib/launch/generate.ts` to see the AI pipeline.
4. `app/how-it-works/page.tsx` — the architecture page is also the best mental map.

## What the user might ask next

- Refining the positioning YAML for any specific product (likely AggLayer or PoS).
- Deploying to Vercel with a custom domain.
- Adding the GTM-telemetry layer (third leg mentioned in `/how-it-works`).
- Recording a Loom walkthrough — site is structured to support a 3–4 minute tour starting at `/`, ending at `/how-it-works`.
- Connecting a real Linear/Notion source instead of a YAML file.

## Gotchas

- `lib/launch/source.ts` uses `process.cwd()` + `fs.readFileSync` — Turbopack warns about this but it works. Keep server-side only.
- The chart components are `"use client"` and wrapped in `<ClientOnly>` to suppress recharts SSR width=0 warnings.
- `getLatestDigest()` and `latestBundle()` both depend on the in-memory store on `globalThis`. If you change the digest payload shape, restart the dev server — old shapes in memory will crash the briefing page.
- Vercel cron is wired in `vercel.json`. The endpoint accepts `?send=1` to actually dispatch emails (cron passes this); without it, it just generates and stores the digest.

## Don't touch

- The forbidden-words list in `positioning/open-money-stack.yml` — that's a feature, not a config knob.
- The honest-data principle in `/rails` and the briefing — surface where Polygon is losing.
