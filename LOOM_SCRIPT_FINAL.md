# Loom recording script · Open Money Intel
*Read this top to bottom while recording. Italics are camera cues, plain text is what you say out loud.*

**Three minutes. 1080p. Face in the corner. URL bar visible the whole time.**

---

## Before you hit record

Open `https://open-money-intel.vercel.app/` in a fresh tab. Dark mode is on by default. Pre-load these in other tabs but don't show them yet: `/launch`, `/launch/debug`, `/positioning`, `/telemetry`, `/how-it-works`. The most important setup step is to go to `/launch`, switch to the Polygon source, and click "Generate with Claude" once so the real AI output is cached. Otherwise the recording lands on `/launch` and the pipeline spins for a minute. Close Slack, Linear, anything that can buzz. Mute the system.

---

## 0:00 – 0:20 · The framing

*Homepage at `/`. Don't scroll. Let the headline do the work while you talk.*

"Hi, I'm Reet. This is a working demo I built for the Polygon Labs PMM role. Quick framing first. The JD basically describes a piece of work that doesn't really exist as a tool today: AI systems that compress positioning into a full launch pack, and then measure what works and feed that signal back into the positioning. So that's what I built, against Polygon's actual pivot from L2 scaling to the Open Money Stack."

---

## 0:20 – 0:50 · The monitoring loop

*Scroll down to the rails section. Hover the Tron card briefly.*

"So this page is reading stablecoin supply from DefiLlama every hour and normalizing it across seven payment rails. Polygon Stack here at the top, then Tron, Solana Pay, Base, Circle, TON, BSC. And honestly, Tron's bigger than the whole Polygon Stack by a pretty wide margin. I wanted that visible on page one because any fintech buyer's going to go check DefiLlama themselves in about thirty seconds anyway. Hiding it would be silly."

*Click "Rails" in the nav.*

"Full comparison view, 7d and 30d changes, sortable. This is the data the weekly briefing actually reads from at run time."

*Click "Briefing" in the nav.*

"Every Monday morning at 8am a Vercel cron triggers Claude through the AI Gateway. What comes back isn't free-form text, it's a typed object with four sections: narrative, Open Money angle, mover reasons, and battlecards. If any of those sections fail validation, the whole run fails closed instead of shipping junk. Then Resend mails it out. What you're seeing here is this week's edition."

---

## 0:50 – 1:50 · Launch in a Box

*Click "Launch" in the nav.*

"Okay, this is the part the JD asks for directly. One YAML file holds the positioning source of truth. The pipeline reads that file and generates six assets for every product. So that's a one-pager, a landing block, a five-email nurture, ten LinkedIn ads, three battlecards, a BD talk track. And then one more call sits on top of all four products and writes a platform-level master narrative across them."

*Point at the source switcher at the top.*

"I wired two positioning sources so you could see this generalizes. Polygon's Open Money Stack with four products, and Circle's Stablecoin Network as a competitor lens. Same buyer, different shape. The pipeline doesn't actually know about either company, it just reads the YAML."

*Click into a product tab. Show the one-pager. Click through the other asset tabs in order: landing, emails, ads, battlecards, BD.*

"Every asset comes back from a typed generateObject call against a strict Zod schema. If the model deviates at all, wrong field shape, headline too long, the call fails closed. The voice rules and the forbidden words list live in the YAML. So things like 'unlocks', 'revolutionary', the whole bucket of words PMMs are kind of tired of seeing. Those rules get pulled into the system prompt at call time. They're not edited in after."

*Click "View prompts and schemas", opens `/launch/debug`.*

"Observability isn't optional for AI systems. All the prompts are on this page, every schema is here, the token count for each call. Someone auditing this could read this page and basically reproduce the run without touching code. Each product runs six calls in parallel, plus the one platform call. Comes out to roughly seventy-five cents per source on Sonnet 4.6, so about a dollar fifty if you regenerate both Polygon and Circle's full packs."

---

## 1:50 – 2:30 · The closing loop

*Click "Telemetry" in the nav.*

"This is the bit most marketing stacks don't have a first-class connection for. Once the assets ship, they fan out across six channels: LinkedIn ads, landing pages, email nurtures, one-pagers, battlecards, BD calls. Each one reports back impressions, CTR, conversions, spend, cost per lead. To be transparent: the numbers you're seeing here are seeded from the source hash so the demo is reproducible. In a production version this layer swaps for LinkedIn Campaign Manager, GA4, Salesforce."

*Scroll down to the green YAML edit suggestion cards.*

"And this is where the loop actually closes. The worst-CPL asset per product turns into a specific YAML edit. The system might tell me, hey, your landing conversion is low, the FAQ answer on production-readiness is the most-clicked element on the page, move that up into the differentiators section. I apply the edit, regenerate the pack, ship. That's the cycle."

---

## 2:30 – 2:55 · The diff page

*Click "Diff" in the nav.*

"One last thing. This page runs the same pipeline against both sources side by side. Polygon's voice is 'ships at 80 percent', and forbids the word 'unlocks'. Circle's voice is 'banking-grade clarity', and forbids the word 'degens'. And then if you look at the generated battlecard for the same competitor, they come out completely different. So consistency stops being a discipline I have to maintain by hand across docs and ads and emails. It just becomes a property of the system."

---

## 2:55 – 3:00 · Close

*Navigate to `/how-it-works` so the architecture diagram is the last visual frame.*

"Code's on GitHub, github dot com slash reetbatra slash open-money-intel. Built end-to-end in about a day. Excited to talk."
