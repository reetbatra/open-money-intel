# Loom recording script · Open Money Intel
*Read top to bottom while recording. Italics are camera cues, plain text is what you say out loud.*

**Target: under 3 minutes. 1080p. Face in the corner. URL bar visible the whole time.**

---

## Before you hit record

Open `https://open-money-intel.vercel.app/` in a fresh tab. Dark mode is on by default. Pre-load these in other tabs but don't show them yet: `/launch`, `/launch/debug`, `/positioning`, `/telemetry`, `/how-it-works`. Critical setup step: go to `/launch`, switch to the Polygon source, click "Generate with Claude" once so the real AI output is cached. Otherwise the recording lands on `/launch` and the pipeline spins for a minute. Close Slack, Linear, mute the system.

---

## 0:00 – 0:20 · The framing

*Homepage at `/`. Don't scroll. Let the headline do the work while you talk.*

"Hi, I'm Reet. I ran the Polygon booth at AggSummit during Devcon, and worked at Dabl Club as DevRel. This is a demo I built for the PMM role. The JD describes work that doesn't really exist as a tool yet: AI that compresses positioning into a full launch pack, and measures what works against Polygon's pivot to the Open Money Stack."

---

## 0:20 – 0:50 · The monitoring loop

*Scroll to the rails section. Briefly hover the Tron card.*

"This page reads stablecoin supply from DefiLlama and normalizes seven payment rails. Polygon Stack, then Tron, Solana Pay, Base, Circle, TON, BSC. Tron's bigger than the whole Polygon Stack. I wanted that visible up front, any fintech buyer's checking DefiLlama themselves anyway."

*Click "Rails" in the nav.*

"Full comparison view. This is the data the weekly briefing reads at run time."

*Click "Briefing" in the nav.*

"Monday at 8am, a Vercel cron triggers Claude through the AI Gateway. Returns a Zod-validated object, four sections, fails closed if any deviate. Resend mails it out."

---

## 0:50 – 1:50 · Launch in a Box

*Click "Launch" in the nav.*

"This is what the JD asks for directly. One YAML file is the positioning source of truth. The pipeline reads it and generates six assets per product: one-pager, landing block, five-email nurture, ten LinkedIn ads, three battlecards, BD talk track. Plus a platform-level master narrative across all four."

*Point at the source switcher.*

"Two sources show the system generalizes. Polygon Open Money Stack, and Circle Stablecoin Network. The pipeline doesn't know about either. It just reads the YAML."

*Click into a product. Show the one-pager. Click through the other tabs: landing, emails, ads, battlecards, BD.*

"Every asset comes from a typed generateObject call against a Zod schema. Wrong shape or headline too long, the call fails closed. Forbidden words live in the YAML — 'unlocks', 'revolutionary' — enforced in the system prompt at call time."

*Click "View prompts and schemas", opens `/launch/debug`.*

"Observability sits here. Every prompt, every schema, the token count per call. About seventy-five cents per source on Sonnet 4.6, so a dollar fifty if you regenerate both packs."

---

## 1:50 – 2:30 · The closing loop

*Click "Telemetry" in the nav.*

"Most marketing stacks don't have a first-class connection here. Assets fan out across six channels reporting impressions, CTR, conversions, cost per lead. Numbers are seeded from the source hash so the demo's reproducible. Production swaps this for LinkedIn Campaign Manager, GA4, Salesforce."

*Scroll to the green YAML edit suggestions.*

"And here's where the loop closes. Worst-CPL asset turns into a concrete YAML edit. The system tells me, landing conversion's low, move the production-readiness FAQ up into differentiators. I apply it, regenerate, ship."

---

## 2:30 – 2:55 · The diff page

*Click "Diff" in the nav.*

"Last thing. Same pipeline, both sources, side by side. Polygon's voice ships at 80 percent, forbids 'unlocks'. Circle's is banking-grade clarity, forbids 'degens'. The battlecard for the same competitor comes out completely differently. Consistency stops being a discipline I maintain. It's a property of the system."

---

## 2:55 – 3:00 · Close

*Navigate to `/how-it-works` so the architecture diagram is the last visual.*

"Code's on github.com slash reetbatra slash open-money-intel. Built in about a day. Excited to talk."
