# Loom walkthrough — Open Money Intel

Target length: **3 minutes**. Record at 1080p. Show your face in the corner (Polygon hires from human contact).
URL bar visible. Cursor moves deliberately — don't pan around chasing things.

---

## Setup before you hit record

1. Open `https://open-money-intel.vercel.app/` in a fresh tab.
2. Make sure dark mode is on (it is by default).
3. Have these tabs pre-loaded but don't show them yet: `/launch`, `/launch/debug`, `/positioning`, `/telemetry`, `/how-it-works`.
4. Make sure `/launch` has clicked "Generate with Claude" at least once on Polygon source so the real AI output is cached.
5. Close Slack, Linear, and any notifier. Mute the system.

---

## The script

### 0:00 – 0:20 · Open with the framing, not the product

> "Hi — I'm Reet. This is a working demo I built for the Polygon Labs PMM role.
> Quick framing before I show anything: the JD describes work that doesn't actually exist as a tool yet —
> AI systems that compress positioning into a full launch pack, then measure what works and feed it back.
> So I built that, against Polygon's real pivot from L2 scaling to the Open Money Stack."

**On screen:** the homepage `/`. Don't scroll yet. The viewer reads the headline while you talk.

---

### 0:20 – 0:50 · Loop 1 — the monitoring view

> "This page reads stablecoin supply from DefiLlama hourly and normalizes seven payment rails.
> Polygon Stack here, Tron, Solana Pay, Base, Circle, TON, BSC.
> The honest cut: Tron is bigger than the Polygon Stack by a lot.
> A PMM dashboard that hides that fails — fintech buyers do the same math themselves."

**Action:** scroll down to the rails section. Hover the Tron card briefly. Then click "Rails" in the nav.

> "Full comparison at /rails. 7d and 30d deltas. This is the data the weekly briefing reads from."

**Action:** click "Briefing" in the nav.

> "Every Monday at 8am, a Vercel cron triggers Claude through the AI Gateway. It returns a Zod-validated briefing object — four sections, never free-form text — and Resend emails subscribers. This is the briefing from this week."

---

### 0:50 – 1:50 · Loop 2 — Launch in a Box (the centerpiece)

**Action:** click "Launch" in the nav.

> "This is the part the JD asks for directly. One YAML file — the positioning source of truth — generates the full asset pack for every product.
> Six assets per product: one-pager, landing page, five-email nurture, ten LinkedIn ads, three battlecards, BD talk track.
> Plus a platform-level master narrative."

**Action:** show the SourceSwitcher at the top.

> "I wired two positioning sources so you can see the system generalizes.
> Polygon's Open Money Stack — four products — and Circle's Stablecoin Network as a competitor lens, same buyer, different shape.
> The pipeline doesn't know about either of them; it just reads the YAML."

**Action:** click into one product tab. Show the one-pager. Then click through the asset tabs (landing, emails, ads, battlecards, BD).

> "Every asset returns from a typed `generateObject` call against a Zod schema.
> If the model deviates — wrong field, headline too long — the call fails closed.
> Forbidden words are enforced in the system prompt; 'unlocks', 'revolutionary', that whole list.
> The voice rules live in the YAML, not the prompts."

**Action:** click "View prompts + schemas" — opens `/launch/debug`.

> "Observability isn't optional for AI systems. Every prompt, every schema, every token count.
> An auditor can read this without running the pipeline.
> Each product runs six calls in parallel; the platform call runs once.
> About a dollar fifty on Sonnet 4.6 for both Polygon and Circle's full packs — twenty-five LLM calls per source."

---

### 1:50 – 2:30 · Loop 3 — the closing loop

**Action:** click "Telemetry" in the nav.

> "The part most marketing stacks don't have a first-class connection for.
> Generated assets fan out to six channels — LinkedIn ads, landing pages, email nurtures, one-pagers, battlecards, BD calls.
> Each one reports impressions, CTR, conversions, spend, cost-per-lead.
> Numbers here are seeded from the source hash so the demo is reproducible; production swaps for LinkedIn Campaign Manager, GA4, Salesforce."

**Action:** scroll down to the green "YAML edit suggestions" cards.

> "This is the loop closing.
> Worst-CPL asset per product becomes a concrete YAML edit:
> 'Landing conversion is low — the FAQ on production-readiness is the most-clicked element. Move that answer into differentiators.'
> Apply the edit, regenerate, ship. That's the cycle."

---

### 2:30 – 2:55 · The diff page (show the system property)

**Action:** click "Diff" in the nav.

> "One more — the positioning diff page.
> Same pipeline against both sources, side by side.
> Polygon's voice — 'ships at 80%', forbids 'unlocks'.
> Circle's voice — 'banking-grade-clarity', forbids 'degens'.
> Look at how the generated battlecard for the same competitor diverges.
> Consistency isn't a discipline the PMM has to maintain. It's a property of the system."

---

### 2:55 – 3:00 · Close

> "Code is on GitHub at github.com/reetbatra/open-money-intel.
> Built end-to-end in about a day.
> Excited to talk."

**End on `/how-it-works` page so the system diagram is the last visual frame.**

---

## What NOT to do

- **Don't read the bullet points.** Talk over them.
- **Don't apologize** for it being a demo. It's a demo. Walk in.
- **Don't open the YAML file** in the recording unless asked — the abstraction is the point.
- **Don't show terminal or VS Code** unless the audience asks. The Loom is for the buyer (hiring manager), not the technical interviewer.
- **Don't say "I hope this is interesting"** or any hedge language. The work has to stand on its own.

## What to do if a section runs long

- Cut Loop 1 to 20 seconds — the briefing tab alone is enough.
- Cut the /positioning diff page entirely. The full Launch in a Box section is non-negotiable.
- Never cut /telemetry — it's the differentiator vs every other "I built an AI thing" demo.
