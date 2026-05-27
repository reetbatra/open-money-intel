# The product, bit by bit — your confidence brief

The live site, page by page, in the order you'll walk a viewer through on the Loom. For each one: what shows up, the JD line it answers, how it actually works, and what to say.

## The 30-second mental model

Memorize this. Everything else is structural detail.

> "Open Money Intel is two AI-driven loops sharing one source of truth. One loop watches the market and writes a weekly briefing. The other takes a positioning YAML and outputs an entire launch pack for every product in it. A third loop feeds the outcomes back into suggested YAML edits. The whole thing runs without anyone in the seat."

---

## Step 1 — Open the homepage at https://open-money-intel.vercel.app/

**What's on screen:** seven payment rails. Polygon Stack, Tron, Solana Pay, Base, Circle, TON, BSC. Stablecoin supply, 7d change, 30d change.

**JD line this answers:**

> "Polygon is mid-pivot from L2 scaling to the Open Money Stack."

The old Polygon dashboard would show L2 TVL, a metric where Polygon happens to look good. I went with stablecoin supply, where Tron is bigger than the entire Polygon Stack. Any fintech buyer can verify that on DefiLlama in thirty seconds, so the dashboard tells them up front.

**How it works:** `lib/data/payments.ts` fetches DefiLlama Stablecoins hourly and normalizes the seven rails defined in `lib/data/payment-rails.ts`. The Polygon Stack here is PoS + zkEVM + CDK + AggLayer summed together, that's the new bundle the Open Money positioning sells, not just PoS on its own.

**What to say (15 seconds):**

> "So I'm reading seven payment rails here. Polygon Stack is in the list, and honestly Tron is bigger than the whole Stack by a pretty wide margin. I wanted that cut up front because any buyer is going to go check DefiLlama themselves in about thirty seconds, so hiding it would be silly."

---

## Step 2 — Click "Rails" in the nav (`/rails`)

**What's on screen:** full comparison table, 7d and 30d deltas, sortable.

**JD line this answers:**

> "Conduct competitive intelligence: payment networks, on-chain analytics, deep market knowledge."

This isn't an AI page. It's the data the AI feeds on. Worth showing because the briefing on the next page isn't writing against a static prompt, it's writing against whatever this table looks like on Monday morning.

**What to say (10 seconds):**

> "Full comparison view. The thing to know is that the briefing AI reads this table at run time, not a static prompt. So if Solana Pay shifts five points week-over-week, the AI sees it before I do."

---

## Step 3 — Click "Briefing" in the nav (`/briefing`)

**What's on screen:** this week's AI briefing. Four Zod-validated sections.

**JD lines this answers:**

> "AI systems fluency, workflows that run without the human."
> "Generate consistent, on-brand content across all marketing surfaces."

Loop one. Vercel cron fires Monday at 8am, hits Claude Sonnet 4.6 through Vercel AI Gateway, and what comes back is a typed object with a fixed shape. Resend mails it out. Nobody touches it between the cron firing and the inbox.

**What to say (20 seconds):**

> "Every Monday morning a Vercel cron triggers Claude through the AI Gateway. What comes back isn't free-form text, it's a typed object: narrative, Open Money angle, mover reasons, battlecards. If any of those sections fail validation, the whole run fails closed instead of shipping junk. Then Resend dispatches it. This week's edition is what you're reading right now."

**Bonus line if there's time:**

> "It's also pretty blunt about where Polygon's losing in any given week. That instruction is baked into the system prompt, it's not me editing the output after."

---

## Step 4 — Click "Launch" in the nav (`/launch`)

**What's on screen:** source switcher between Polygon and Circle, four product tabs, six asset tabs per product.

**JD line this answers** (this one is literal text from the role):

> "Compress full launch asset sets from a single positioning source of truth: one-pagers, landing page variants, email sequences, ad copy, BD talk tracks generated in a single pass."

This page is that exact sentence built and running. One YAML file at `positioning/open-money-stack.yml` holds the voice, the forbidden-words list, the four products with their problems and ICPs and competitors, plus the platform-level positioning. The pipeline reads that file. Six parallel Sonnet calls per product produce the one-pager, landing block, five-email sequence, ten LinkedIn ads, three battlecards, and the BD talk track. One additional call writes the platform master narrative on top. Twenty-five calls per source, about seventy-five cents, done in about a minute.

**How it works mechanically:** `lib/launch/source.ts` parses the YAML and runs it through a Zod schema. `lib/launch/generate.ts` runs the twenty-five calls in parallel using `Promise.allSettled`. Each call uses `generateObject` against a strict per-asset schema. The forbidden-words rule sits in the system prompt. Output gets cached in memory and rendered to `/launch`.

**What to say (45 seconds):**

> "This is the part the JD literally describes. One YAML, the positioning source of truth. From that, six assets for every product. One-pager, landing block, five-email sequence, ten LinkedIn ads, three battlecards, BD talk track. Plus a platform master narrative across all of them. Roughly twenty-five LLM calls per source, runs in a minute, costs me around seventy-five cents. And the pipeline doesn't know it's running on Polygon, it just reads the YAML."

Click into a product. Show the one-pager. Click through the rest of the tabs. Don't read the copy out loud, just let the viewer see that every slot is filled with real, shippable output.
