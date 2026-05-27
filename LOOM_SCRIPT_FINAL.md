# Loom recording script · Open Money Intel
*Read top to bottom while recording. Italics are camera cues, plain text is what you say out loud.*

**Target: under 3 minutes. 1080p. Face in the corner. URL bar visible the whole time.**

---

## Before you hit record

Open `https://open-money-intel.vercel.app/` in a fresh tab. Dark mode is on by default. Pre-load these in other tabs but don't show them yet: `/launch`, `/launch/debug`, `/positioning`, `/telemetry`, `/how-it-works`. Critical setup step: go to `/launch`, switch to the Polygon source, click "Generate with Claude" once so the cached output loads instantly. Otherwise the recording lands on `/launch` and the pipeline spins for a minute. Close Slack, Linear, mute the system.

---

## 0:00 – 0:20 · The framing

*Homepage at `/`. Don't scroll. Let the headline do the work while you talk.*

"Hi, I'm Reet. I ran Polygon's booth at AggSummit during Devcon, and was DevRel at Dabl Club. This is a demo I built for the PMM role. The JD basically describes a piece of work that doesn't exist as a tool yet. AI that turns positioning into a full launch pack, and then watches what's actually working and feeds that back. So I built it, around Polygon's pivot from L2 scaling to the Open Money Stack."

---

## 0:20 – 0:50 · The monitoring loop

*Scroll to the rails section. Briefly hover the Tron card.*

"So this page is pulling stablecoin supply from DefiLlama every hour, across seven payment rails. Polygon Stack at the top, then Tron, Solana Pay, Base, Circle, TON, BSC. Tron's bigger than the whole Polygon Stack right now. I wanted that on page one. Any fintech buyer's going to check DefiLlama themselves anyway."

*Click "Rails" in the nav.*

"Full table here, 7d and 30d changes. This is what the weekly briefing reads at run time."

*Click "Briefing" in the nav.*

"Every Monday at 8am, a Vercel cron calls Claude through the AI Gateway. Four sections come back as a strict typed object. If any one breaks validation, the whole run fails closed instead of shipping junk. Then Resend mails it out."

---

## 0:50 – 1:50 · Launch in a Box

*Click "Launch" in the nav.*

"Okay, this is the part the JD asks for directly. One YAML file holds all the positioning. The pipeline reads it and generates six assets for every product. So that's a one-pager, a landing block, a five-email nurture, ten LinkedIn ads, three battlecards, a BD talk track. And on top of all four products, one more call writes the platform-level master narrative."

*Point at the source switcher.*

"I wired up two positioning sources so you can see this generalizes. Polygon's Open Money Stack, and Circle's Stablecoin Network. The pipeline doesn't actually know about either. It just reads the YAML."

*Click into a product. Show the one-pager. Click through the other tabs: landing, emails, ads, battlecards, BD.*

"Every asset gets generated against a strict schema. If the shape's wrong or a headline's too long, the call fails. The voice rules and the forbidden words list both sit in the YAML. So things like 'unlocks', 'revolutionary', that whole bucket of words PMMs are tired of seeing. Those get pulled into the prompt at call time."

*Click "View prompts and schemas", opens `/launch/debug`.*

"All the observability is here. Every prompt, every schema, every token count. Sonnet 4.6 runs about seventy-five cents per source. A dollar fifty if you regenerate both packs."

---

## 1:50 – 2:30 · The closing loop

*Click "Telemetry" in the nav.*

"This is the part most marketing setups don't actually close. Assets fan out across six channels, and each one reports impressions, CTR, conversions, cost per lead. To be honest with you, the numbers here are seeded so the demo's reproducible. In production, this layer swaps for LinkedIn Campaign Manager, GA4, Salesforce."

*Scroll to the green YAML edit suggestions.*

"And here's where the loop actually closes. The worst-CPL asset turns into a concrete YAML edit. So the system might tell me, hey, landing conversion's low, move the production-readiness FAQ up into differentiators. I apply it, regenerate, ship."

---

## 2:30 – 2:55 · The diff page

*Click "Diff" in the nav.*

"Last one. Same pipeline, both sources, side by side. Polygon's voice rule says 'ships at 80 percent' and forbids 'unlocks'. Circle's is banking-grade clarity, forbids 'degens'. And then if you look at the battlecards for the same competitor, they come out completely different. So I don't have to maintain consistency by hand across docs and ads and emails anymore. The system just does it."

---

## 2:55 – 3:00 · Close

*Navigate to `/how-it-works` so the architecture diagram is the last visual.*

"Code's on github.com slash reetbatra slash open-money-intel. Built in a day. Excited to talk."
