# Open Money Intel

A live competitive-intelligence dashboard for onchain payment rails, plus a "Launch in a Box" pipeline that compresses a positioning source-of-truth into a full multi-product asset package via Claude.

Built as a demo for the [Polygon Labs Product Marketing Manager role](https://jobs.ashbyhq.com/polygon-labs/897b111d-f8ae-4759-a58e-75238ec8196d).

## What's in it

| Route | What it is |
|---|---|
| `/` | Hero, live stablecoin supply chart, seven payment rails, movers panel, subscribe |
| `/rails` | Full payment-rail comparison (Polygon Stack vs Tron, Solana Pay, Base, Circle, TON, BSC) |
| `/launch` | **Launch in a Box** — positioning YAML → 6 assets per product (one-pager, landing page, 5-email nurture, 10 LinkedIn ads, 3 battlecards, BD talk track) + platform-level pitch |
| `/briefing` | AI-generated Monday digest: narrative shift, Open Money Stack angle, movers, battlecards |
| `/how-it-works` | Architecture explainer with system diagram (Loom-friendly) |
| `/dashboard` | L2 legacy view (explicitly secondary — Polygon's old narrative) |

## Quick start

```bash
pnpm install
pnpm dev
# → http://localhost:3000
```

If port 3000 is busy: `PORT=3030 pnpm dev`.

The site runs end-to-end **without any keys** — there's an in-memory database fallback, and the AI calls fall back to high-quality deterministic templates when no AI key is set.

## Going from "works" to "shows real Claude output"

The Launch in a Box and weekly briefing both call Claude through Vercel AI Gateway. They fall back to deterministic templates when unauthenticated.

To enable the live AI path locally, set one of:
- `AI_GATEWAY_API_KEY` — Vercel AI Gateway key (recommended)
- Or deploy to Vercel where AI Gateway auth works without an explicit key

Optional for the full experience:
- `DATABASE_URL` — Neon Postgres (subscriber and digest storage)
- `RESEND_API_KEY` + `RESEND_FROM` — outbound email
- `CRON_SECRET` — auth on `/api/cron/weekly`

See `.env.example` for the full list.

## Key files

- `positioning/open-money-stack.yml` — the single source of truth for Launch in a Box. Edit this; everything downstream regenerates.
- `lib/data/payment-rails.ts` — curated payment-rail definitions (which DefiLlama chains compose each rail).
- `lib/launch/generate.ts` — the per-product asset pipeline (6 parallel `generateObject` calls per product, 1 platform-level call).
- `lib/launch/fallback.ts` — deterministic template fallback used when no AI key is set.
- `lib/intel/generate.ts` — weekly briefing generator (5 sections, Zod-typed).
- `app/how-it-works/page.tsx` — the architecture page with the inline SVG diagram.

## Tech stack

Next.js 16 (App Router, Turbopack) · Tailwind 4 · Vercel AI Gateway (Claude Sonnet 4.6) · Zod on every AI boundary · Drizzle + Neon (in-memory fallback for dev) · Resend · Recharts · DefiLlama Stablecoins + L2Beat APIs.

## Deployment

`vercel.json` already wires a Monday 08:00 UTC cron at `/api/cron/weekly?send=1`. Push to Vercel, set env vars in the dashboard, ship.

## Status (handoff snapshot)

Build is clean. All routes return 200. Five pages screenshotted in `/tmp/v2-*.png` from the last build. Git: one initial create-next-app commit, all of the v2 work is uncommitted — review the diff with `git status -uall` before your first commit.
