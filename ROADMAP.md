# Art Lab — Product Roadmap
<!-- Last updated: 2026-03-12 -->
<!-- Companion to CLAUDE.md. Read CLAUDE.md first. -->
<!-- This document is the delegation brief: what Art Lab is for, where it's heading, and in what order. -->
<!-- Every development session should be traceable to a theme here. -->

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
