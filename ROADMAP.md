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

## What This Roadmap Is Not

Not a sprint plan. Not a commitment to dates. Not a complete feature list.

It's the shape of the thing — written clearly enough that any development session can orient to it, and any potential institutional partner can understand what's being built and why.

When priorities shift, update this file before touching code.
