# Art Lab — Product Roadmap
<!-- Last updated: 2026-07-03 -->
<!-- Companion to CLAUDE.md. Read CLAUDE.md first. -->
<!-- This document is the delegation brief: what Art Lab is for, where it's heading, and in what order. -->
<!-- Every development session should be traceable to a theme here. -->

---

## New Direction (2026-07-03) — WIP feedback as the central feature

**Status: stated intent, not yet built. Everything below this section is the prior framing — kept for reference, not yet reconciled with this pivot.**

### The idea

Alan is spinning off the work-in-progress (WIP) feedback mode currently living in Hidden Grammar of Art (`hidden-grammar-of-art`, a separate site) and bringing it here, to Artists Are Jerks — not as one more mode among many, but as **the central feature of the site**. An artist uploads work still in process and gets grounded, non-judgmental perceptual feedback: what's observably present, what it's doing perceptually, held apart from interpretation and completely apart from quality verdicts. That's the front door.

The rest of the Hidden Grammar framework — docent-style commentary, critical readings, tour-guide narration, how-to-look instruction, the kind of content this roadmap's prior framing spread across many "lenses" and toolkit modes — becomes **a secondary layer**: an added benefit available to anyone who joins the site, not the reason someone shows up. WIP feedback is the reason someone shows up.

### Why this is a pivot, not an addition

The existing roadmap below this section describes Art Lab as wide at the top: three personas, a large toolkit of analytical lenses, an institutional-credibility theme aimed at museum education directors and university faculty, a three-tier monetization plan. That's a different product shape than "one thing, done well, for artists mid-process." Alan has said this earlier framing doesn't land with him right now — this note doesn't resolve that tension, it just names it so the next session doesn't quietly build against two different premises at once.

### What looks like it survives this pivot

- The underlying Hidden Grammar analysis engine and prompt architecture — the perceptual observation → registered interpretation discipline is the actual asset, independent of how many modes sit on top of it.
- The `/hidden-grammar/for/artist` persona page — already built around exactly this audience.
- The WIP mode's Exploration Panel ("What could this become?") — already live, already artist-in-process-shaped.
- Some form of account/access system (prior Theme 5) — sustainability doesn't go away just because the product gets narrower, though the three-tier shape may not survive in its current form.

### What looks like it doesn't survive

- Theme 3 (lenses as the headline differentiator) — a "17 critical frameworks" pitch is the opposite of "one clear thing."
- Theme 4 (institutional distributor / "ship captain" framing) — written for a different audience than an artist opening the site to get unstuck on a painting.
- The toolkit-as-primary-navigation pattern — if WIP feedback is the front door, the toolkit's many-modes-by-use-case structure is no longer what a first-time visitor should see first.

### What this needs before it's buildable

- A concrete decision on what actually gets ported from `hidden-grammar-of-art`'s WIP mode — prompt text, register discipline, image-handling — versus what's rebuilt fresh here.
- A decision on what "side commentary and instruction" concretely means as a secondary layer: is it the existing docent/critic/tour modes wholesale, a trimmed subset, or something reshaped around supporting the WIP-feedback front door specifically?
- Reconciliation with the account/monetization theme below — a narrower, single-purpose product may want a simpler access model than the three-tier plan assumes.
- **Step B cross-model corroboration — see below. Treat as load-bearing for this pivot, not optional polish.**

### Why Step B matters more here than it did anywhere else this framework has lived

Grammar of Things and Hidden Grammar of Art both run a "Step B" synthesis: instead of trusting a single AI read, the image gets described independently by multiple separately-trained models (Claude, Gemini, OpenAI), and a separate pass classifies each observed claim by how well it held up across those independent reads — genuinely corroborated across models, a possible single-model quirk, or actively contradicted. Grammar of Things also tags each of its principles with a static assessment of whether a model plausibly has real training data behind that kind of claim at all, versus just sounding plausible. Where a claim is both cross-model-corroborated *and* the underlying principle has no real training-data grounding, the system attaches an explicit caveat: agreement across independently-built models is real evidence against one model inventing something, but it isn't evidence the claim is *correct* — the models could just as easily be converging on a shared descriptive habit from overlapping training data rather than each independently verifying a real physical fact.

Earlier, discussing whether Hidden Grammar of Art needed this, the case against was that known, exhibited works already have an external check — Manet's *Olympia* has 150 years of art-historical scholarship a reader can go verify a claim against. That argument doesn't apply here. WIP feedback is by definition about work with no scholarship, no prior criticism, no canon — often work nobody but the artist has ever seen. There is no answer key to check the AI's read against, which is exactly the situation Grammar of Things' archaeological artifacts are in (a claim about a specific object's wear pattern may be the only observation of it that has ever been written down). The difference here is who's on the receiving end: not a researcher cross-checking a claim against literature, but an artist deciding whether to trust what a machine told them about their own unfinished work. That's a higher-stakes audience for an ungrounded-but-confident claim to reach, not a lower one.

Practically, this means: if WIP feedback becomes this site's central feature, it should not launch as a single ungrounded model pass, even though that's the simpler build. The Grammar of Things implementation (Step B restructured to a structured per-claim classification, static grounding tags per principle, and a deterministic — not model-authored — caveat attached when a claim is corroborated but ungrounded) is a working, verified reference design, not a proposal — it's live in production there today. Porting the pattern is real work (Hidden Grammar of Art's own principle set would need the same grounding-tag pass Grammar of Things got, and the caveat template's wording would need to fit an artist's voice rather than a researcher's), but it doesn't need to be invented from scratch.

### Default behavior: no canon comparison unless the artist asks for it

Checked whether the existing `/corpus/` reference material or the `hidden-grammar/corpus.astro` artifact browser already handle this — they don't. The `/corpus/` directory is dev-time source material (critics, canonical works, evaluative criteria) for building domain-appropriate prompt framing in *other* domains (CPG, craft, archaeological, pattern-design), not a live artist-vs-canon comparison feature. `corpus.astro` is an archaeological-artifact browsing UI, an early prototype of what's now the standalone Grammar of Things site. Neither does this work already — it needs to be decided and built.

The decision: WIP feedback should not compare a novice or intermediate artist's work to the art canon by default. "This evokes Rothko's color-field approach" reads as either a compliment or an implicit indictment depending entirely on how developed the artist already feels, and it smuggles evaluation back into a tool whose whole discipline (already established in Pass 1 across every one of these projects — pure observation, no interpretation, no quality judgment) is built to withhold exactly that. An artist who wants a canon-comparative read can ask for it explicitly, as its own prompt — that's a real, valid mode, just not the default one. Revisit what that opt-in prompting looks like later; for now, the default WIP path should not reach for the canon on its own.

---

## What Art Lab Is

A perceptual analysis tool for working artists and art-curious educators. You upload an image. The AI examines what's physically present, names the perceptual and neural mechanisms at work, and holds interpretation as hypothesis — not verdict.

The goal for a working artist who uses it fully: they leave with a vocabulary for what their work is actually doing, grounded in observable evidence, without a quality judgment in sight.

Art Lab runs on the Hidden Grammar framework — 54 principles, 11 roots, organized into tiers by perceptual robustness. The framework is the constraint system that keeps the AI from confabulating. It is not the product. The product is the analysis experience.

---

## What "Done" Looks Like

A working artist mid-process can upload an image, choose an analytical angle appropriate to where they are in the work, receive output they can trust because they can see what's observable vs. inferred, push back with a follow-up question, apply a critical lens to stress-test a reading — and leave with something they can use in the studio tomorrow.

An educator or docent can use the same tool to prepare a tour, generate wall text, or teach formal analysis to students who've never thought about why a painting holds them.

Neither audience requires a framework explanation to use it.

---

## Themes — In Priority Order

### Theme 1: Make the AI's reasoning legible

The analysis output must signal what it knows from looking versus what it's extrapolating. A reader should be able to calibrate their trust at the sentence level without knowing the system architecture.

**Why first:** This is the trust foundation. Without it, the tool is a confident-sounding black box. With it, it's a transparent thinking partner.

**In progress:**
- ✅ Three-register language conventions added to `basePrompt` (visible / perceptual effect / interpretation — each anchored to distinct phrasing)

**Next:**
- Consider whether the tier system (A–D epistemic robustness) should surface in output — either as inline markers or as a closing note on confidence level
- Evaluate whether the interrogation window should reinforce the same three registers

---

### Theme 2: Expand the analytical toolkit from 4 modes to a full suite

Four domain modes are live (Fine Art, CPG, Comic Book, Commercial Illustration). The MODES_REGISTRY identifies 6 documented modes ready to wire in, and 36 more in various stages of specification.

**Why second:** The tool is currently wide at the domain level but shallow analytically. The documented modes — Studio Foundations, Attention Engineering, Physics Mode, Tour Guide, Docent Script — address the artist-in-process use case directly, which is the primary audience.

**Sequencing logic (from MODES_REGISTRY Section 4):**
1. Wire in the 6 DOCUMENTED modes to `analysisModes.js` as a new `analytical-lenses` domain card — prompts already written, low implementation cost
2. Write prompts for the External Lenses block (26 lenses from `interrogation_lenses.md`) — most developed gap material, high value for the stress-testing audience
3. Friction Audit and Historian Mode — stubs in `hg-modes.json`, source material in prompt_console
4. Philosophical Plug-ins (Kant, LeWitt, Deleuze, Wittgenstein, Plato) — resolve the architectural question first: standalone modes or interrogation window add-ons?

**Do not build yet:** GIFT modes, DISTILL modules, RADAR, DS-MAX — useful but specialized, build after core analytical lenses are live.

---

### Theme 3: Make the lenses a first-class feature

The External Lenses (OOO, Phenomenological, Deconstruction, Semiotics, Greenberg, Saltz, Yau, etc.) are currently live as post-analysis overlays in the interrogation window — but they're buried. Most users won't find them.

**Why third:** Lenses are the highest-leverage differentiator. No other tool lets you reframe the same visual evidence through 17 different critical frameworks. The stress-testing audience — artists who want adversarial reads, educators who want to teach critical theory — gets here and finds the real depth.

**What this means architecturally:**
- Lenses should be discoverable from the main navigation, not only from the results panel
- Consider a dedicated entry point: "Apply a lens" as a top-level action alongside "Analyze a work"
- The Hostile Witness lens (intent-first adversarial read) needs to surface more prominently for artists who want the hardest read

---

### Theme 4: Support the ship captain use case

Institutional distributors (museum education directors, university art faculty) need to understand what Art Lab is and where it's going before they'll recommend it to students or integrate it into a curriculum.

**Why fourth:** Not a feature — a communication problem. The tool exists. The credibility signal doesn't yet.

**What this requires:**
- A public-facing explanation of the framework that doesn't require a framework explanation to understand (the "Why I Built This" page, currently in draft)
- Visible evidence that the tool is under active development and improving (a lightweight public changelog or version note)
- One concrete example of the tool being used in a real educational context — a docent using Tour Guide Mode at the Schneider, a class critique using Studio Foundations — documented simply

---

## Active Work Right Now

**Zone:** `src/pages/hidden-grammar/`, `src/data/analysisModes.js`, `src/data/toolkit-modes.js`, `src/scripts/ai-analyze/`, `src/layouts/HiddenGrammarLayout.astro`, `src/pages/api/analyze-artwork.ts`

**Do not touch:** Anything outside the above paths unless explicitly requested.

**Current architectural state:**
- `analysisModes.js` — single source of truth for all live AI modes, prompts, fields. `basePrompt` and `interrogationBase` are non-negotiable and prepended server-side to every call.
- `analyze-artwork.ts` — API endpoint. Handles initial analysis and interrogation mode. Model: `claude-sonnet-4-6`. Max tokens: 4096 (analysis), 2048 (interrogation).
- `toolkit-modes.js` — Toolkit navigation layer organized by use-case bucket (Making / Analyzing / Talking / Stress Testing). Status field drives UI display: `live`, `documented`, `coming-soon`.
- `MODES_REGISTRY.md` — Human-readable index of all modes with status. When in doubt, the site wins over this document.

**Recently completed:**
- Three-register language conventions added to `basePrompt` (Theme 1)
- Toolkit navigation layer built with four use-case buckets
- Feedback widget integrated post-analysis
- Lens modifier integrated in results panel (post-analysis overlay)
- Signal Profile page built

**Immediate next action (lowest cost, highest value):**
Wire the 6 DOCUMENTED modes into `analysisModes.js` as a new domain card. Source: `src/data/hg-modes.json`. Modes: Studio Foundations, Attention Engineering, Attention Engineering (IR), Physics Mode, Tour Guide Mode, Docent Script (Anchor V1).

---

### Theme 5: Accounts, access control, and cost sustainability

The current shared-password system has no individual accountability. One bad actor forces a password reset that punishes every legitimate user. Alan pays all token costs with no visibility into who is running what or how much. This doesn't survive growth.

**Why fifth:** The tool works. The framework works. The risk now is operational—an uncontrolled API bill and no mechanism to scale access responsibly. This theme builds the infrastructure that makes Art Lab sustainable as the audience grows.

**The problem in plain terms:**
The shared password gives Alan no way to revoke one user without affecting everyone. He has no usage data. There is no path to charging users or having them cover their own token costs. This gets addressed before the public launch.

---

#### Three-tier access model

**Tier 1 — Try Me (already exists, stays public)**
The green "Try Me" button on the Art Lab home page, wired to `first-look` mode. No account required. No storage. Alan pays the small token cost. This is the taste. It doesn't change.

**Tier 2 — Standard (Phase 1 build target)**
Account required. Full Toolkit access—all modes, all prompts. No storage. Analysis appears on screen; user copies it themselves via the existing copy button. Alan pays tokens during beta. Moves to user-pays when billing is introduced.

**Tier 3 — Premium (Phase 2 build target)**
Account required. Full Toolkit access plus stored analyses, retrievable across sessions. Future home of contrast/compare tools when that project is ready. Paid tier.

---

#### Beta phase

Invitation-only. Alan sends invites by hand. Invitees get Standard or Premium access at Alan's discretion. Goal: validate the account system works without breaking the existing experience, and observe usage patterns before opening to the public. Feedback stays informal—text, email, in-person. No formal collection mechanism needed.

When beta ends: open registration turns on. Anyone can create a Standard account. Premium requires upgrade.

---

#### Admin visibility (minimum viable)

Alan needs to see: who has an account, when they last logged in, how many analyses they've run. A simple D1 query or basic dashboard is enough for beta. A proper admin UI is Phase 2.

---

#### Monetization options (decision required before Phase 2 ships)

The account infrastructure supports all three. The decision doesn't block Phase 1.

**Option A — Credit packs.** Users buy a block of analyses (e.g., 20 for $10). Each analysis deducts one credit. Hard cap. Simple to understand. Easy to implement with Stripe. Good for occasional users.

**Option B — Subscription tiers.** Monthly fee for access. e.g., Standard free or low cost, Premium $20/mo. Recurring revenue. Mirrors how Claude, Midjourney, and similar tools work. Requires Stripe + subscription management.

**Option C — BYOK (Bring Your Own Key).** User connects their own Anthropic (or other LLM) API key in account settings. Their key is used for their analyses. Alan pays nothing for their usage. Requires secure key storage encrypted at rest. Good for power users who already have API access.

Recommended starting point: BYOK for technical beta users; credit packs for general public launch. Subscriptions as a third option once usage patterns are clear.

---

#### Build sequence

**Phase 1 — Auth gate (replaces shared password)**
- Clerk (`@clerk/astro`) for per-user accounts, invitation-only mode during beta
- Replace `middleware.ts` password check with Clerk auth
- `sign-in` and `sign-up` pages under `/hidden-grammar/`
- Keep "Try Me" fully public; gate "Start Analyzing" behind auth
- Basic usage logging to D1 (user ID, analysis count, timestamp)

*External requirements: Clerk account + app, Cloudflare KV namespace for sessions, D1 database.*

*Done when: Alan can invite one person, that person creates an account and accesses the Toolkit, and Alan can see they've logged in and run analyses—without that affecting any other user.*

**Phase 2 — Admin visibility + Standard/Premium split**
- Simple admin dashboard (users + usage, read-only)
- Storage API: save analyses to D1 per user (Premium only)
- Analysis history page for Premium users
- Account settings page

**Phase 3 — Billing**
- Stripe integration
- Credit pack purchasing and/or subscription setup
- BYOK key input in account settings
- Usage metering tied to billing tier

---

#### What this explicitly does not include

- Comparison/contrast tools — separate future project
- Formal feedback collection during beta
- Social features (sharing, public profiles)
- Any changes to existing modes, prompts, or the Hidden Grammar framework

---

## Analysis Output Architecture — Future Consideration

### Split output for Comprehensive Analysis (Option D)

Currently the Fine Art Comprehensive Analysis generates VIEWER EFFECTS, IMAGE PROPERTIES, and all 11 Root sections in a single model call. This pushes against output token limits — the basePrompt overhead plus a rich analysis exhausts available tokens before all Roots are covered.

**The right long-term architecture:** split the Comprehensive Analysis into two sequential calls with separate output panels:
- **Call 1:** Opening paragraph + VIEWER EFFECTS (predicted response, prose, sustained attention, confirmation/violation axis)
- **Call 2:** IMAGE PROPERTIES + full 11-Root breakdown (with its own dedicated token budget)

This would allow full depth on both halves without either truncating. The UI would need to support a two-panel or sequential output display, and the API endpoint would need to handle the two-call sequence.

**Current workaround:** The tiered root format (Dominant / Supporting / Silent with hard sentence caps) manages the token constraint within the single-call architecture. Revisit this when the account system and output UI are being rebuilt for Phase 2.

---

## What This Roadmap Is Not

Not a sprint plan. Not a commitment to dates. Not a complete feature list.

It's the shape of the thing — written clearly enough that any development session can orient to it, and any potential institutional partner can understand what's being built and why.

When priorities shift, update this file before touching code.
