# Noise Audit → Four-Domain Analysis — Development Log

Mode in development for Art Lab / Hidden Grammar.
**Status:** Concept expanded significantly. Noise Audit is now the diagnostic layer of a larger foundational prompt. Architecture and naming decisions pending before any implementation.

---

## The Big Reframe (May 3, 2026)

The Noise Audit prompt is complete and tested. But in developing it, we landed on something larger.

**Core insight:** The AI's accuracy in Art Lab comes from absorbing vast human discourse about art across four distinct domains simultaneously — art criticism, technical writing about medium and process, philosophical/theoretical texts, market and institutional commentary. The current Hidden Grammar prompts deliberately constrain the model to one domain (perceptual/neurological). The four-domain prompt would be the first that stops constraining it and lets it use the full breadth of what it actually absorbed.

This is also the answer to "how does it know that?" — the question Alan's audiences ask when they're blown away by the tool's accuracy. It knows because humans wrote about art in all four registers for centuries, and the model read all of it. The framework makes explicit what was always operating underneath.

**The four-domain structure is the foundational prompt.** All other Art Lab modes are subsets — zooming into one quadrant or serving a specialized use case. This is the first full read.

---

## Four-Domain Framework

A 2x2 grid, two axes:
- X-axis: Internal (what the work IS) vs. External (what the work MEANS in context)
- Y-axis: Pre-linguistic/universal vs. Linguistic/constructed

```
                  INTERNAL               EXTERNAL
                (what it IS)         (what it MEANS)

PRE-LINGUISTIC   Perceptual/            Cultural/
  (universal)    Neurological        Institutional

  LINGUISTIC     Material/            Conceptual/
 (constructed)    Formal              Historical
```

**Noise** is not a fifth domain — it's a diagnostic overlay that runs across all four quadrants. It asks: what's unresolved, what's interfering, what's preventing this work from operating fully in each register? And critically: is the noise in any quadrant intentional — serving a purpose in another quadrant?

### The Four Domains

**Perceptual/Neurological** (Internal, Pre-linguistic)
- What the visual system does before interpretation begins
- Hierarchy, bid strength, reward signal, dwell time, interference patterns
- Hidden Grammar's home territory — 54 Principles and RAP apply here
- Noise = unresolution without a legible reward signal

**Material/Formal** (Internal, Linguistic)
- The actual physical choices: medium, substrate, process, surface
- What the maker built and how the making is present in the object
- Greenberg's territory — medium honesty, process visibility, material behavior
- Distinct from perceptual (what the viewer's system does) and conceptual (what argument it serves)
- Noise = material choices that contradict or undermine the formal structure

**Conceptual/Historical** (External, Linguistic)
- What argument or system of ideas the work is in dialogue with
- Historical currencies — what movements, theories, positions is it responding to?
- Where perceptual "failure" may be the conceptual instrument (Mondrian, Kandinsky)
- **No RAP constraint. No 54 Principles constraint. Full LLM knowledge applies.**
- Noise = internal contradiction in the work's argument, or perceptual/material elements that undermine the conceptual position

**Cultural/Institutional** (External, Pre-linguistic)
- Where the work sits in the desire field, canon, and market
- Mimetic desire (Girard): people desire what culture has already validated as desiring
- Bourdieu's field theory: cultural capital, distinction, institutional legitimacy
- **No RAP constraint. No 54 Principles constraint. Full LLM knowledge applies.**
- Noise = signals that fail to participate in the shared desire field (accidental illegibility vs. intentional transgression)

### Noise Diagnostic Overlay
Runs across all four quadrants after the domain readings. Asks:
1. What's blocking each quadrant from operating fully?
2. Is the noise in any quadrant intentional — serving a purpose in another?
3. Cross-quadrant synthesis: do the four readings reinforce, contradict, or run independently?

---

## Relationship to Existing Noise Audit Prompt

The Noise Audit prompt (see below) is now understood as: the Perceptual/Neurological quadrant + the Noise Diagnostic overlay. It stands alone as a useful tool. But within the four-domain structure, it's one quadrant of the full read.

The Pattern/Textile Redirect and Domain Override from the Noise Audit fold into the full structure naturally.

---

## Naming

**"Noise Audit"** — now understood as too small. Accurate for the perceptual diagnostic alone.

**Name for the four-domain foundational prompt:** TBD. Needs to signal scope without being clinical. Options to consider:
- "Full Register Analysis"
- "Signal Map"
- "The Complete Read"
- Something that fits the Art Lab / Hidden Grammar vocabulary

---

## Architecture Decision

This cannot run through `analyze-artwork.ts` at 4096 tokens. Needs its own page and API endpoint — the Framework Extension pattern (`framework-extension.astro` + `/api/framework-extension`).

Proposed passes:
- **Pass 1:** Pure formal observation (no framework framing) — like Framework Extension Pass 1
- **Pass 2:** Four domain readings + noise diagnostic overlay + synthesis

Pass 1 output feeds Pass 2. True chaining. Each pass has its own token budget.

Framework Extension already proves this pattern works.

---

---

## Core Concept

Noise isn't complexity. Noise isn't entropy. Noise isn't absence.

**Noise is unresolution without a legible reward signal.**

Productive discomfort defers settlement while promising that staying will yield something. Noise defers settlement without that promise. The work exits the attention market without ever competing.

This mode is a debugging tool, not a description tool. The question it answers: what is this work working against?

---

## Four Interference Mechanisms

1. **Canceling Conflicts** — two principles at equal weight, no hierarchy, neither wins, viewer fatigues
2. **Redundancy Without Reinforcement** — multiple principles restating the same signal, no new territory built
3. **False Resolution** — work settles accurately but shallowly, viewer moves on before reward accumulates
4. **Register Mismatch** — principle operating at the wrong scale for its content (room-scale bid on close-range payoff, or vice versa)

---

## Domain Framework (Key Expansion)

Three domains, each with separate jurisdiction. Works can operate in multiple simultaneously.

- **Perceptual** — pre-conscious, neurological, largely universal. Hierarchy, bid strength, reward signal, dwell time. Hidden Grammar's home territory.
- **Conceptual** — operates through ideas the work is in dialogue with. Requires activation by knowledge. Perceptual flatness may be the conceptual instrument (Mondrian: the perceptual thinness IS the argument).
- **Cultural** — institutional and historical position. Canon, market, collection, critical discourse.

These don't share a scoring system. "Fails perceptually" is not "fails." The domain step separates intentional from accidental.

---

## Pattern / Textile Redirect (Key Expansion)

Fine art failures often map directly onto pattern design virtues:

| Fine Art Interference | Pattern Virtue |
|---|---|
| Redundancy without reinforcement | All-over rhythm; eye travels without landing; repeat-friendly |
| Canceling conflict at equal weight | No focal point; non-directional print |
| False resolution via flat fill | Graphic clarity at reproduction scale; holds in repeat |
| Register mismatch (quiet lines over masses) | Natural layered print structure |

If 2+ interference patterns are present, the prompt auto-detects pattern potential and redirects.

---

## Current Complete Prompt

```
You are performing a Noise Audit on this work. Your task is not to 
describe what the work does. Your task is to identify what is 
preventing the work from doing it.

Apply the RAP Protocol throughout: no interpretive claim without at 
least two independent visual observations to support it. State what 
you see before stating what it means.

---

DEFINITIONS

Noise is unresolution without a legible reward signal. A viewer's 
attention stalls not because the work is complex, but because the 
work cannot signal that staying will yield something.

Noise is not:
- Complexity (a highly complex work can cohere completely)
- Entropy (disorder is a signal, sometimes the loudest one)
- Absence (empty space is a bid, not a failure)

---

STEP 0: DOMAIN IDENTIFICATION

Before running the perceptual analysis, identify the primary 
domain(s) this work is addressed to:

PERCEPTUAL DOMAIN
The work's primary address is to the viewer's attention system 
before conscious interpretation begins. Hierarchy, reward signal, 
and dwell time are the relevant criteria. The full diagnostic below 
applies.

CONCEPTUAL DOMAIN
The work's primary address is to an argument, system of ideas, or 
philosophical position. Perceptual flatness may be the conceptual 
instrument—the work deliberately withholds perceptual reward in 
order to make its idea legible. Assess perceptual structure, but 
frame findings relative to the conceptual specification: is the 
perceptual address minimal by design?

CULTURAL DOMAIN
The work's primary address is to its position within art history, 
institutional context, or critical discourse. Perceptual and 
conceptual analysis remain valid, but neither constitutes a verdict 
on the work's significance.

A work may operate in multiple domains simultaneously. Name all that 
apply and note which is primary. This determines what counts as 
success or failure in the analysis that follows.

If the work is primarily conceptual or cultural, note: the 
perceptual analysis describes one dimension of the work's 
operation—not a verdict on its value.

DECLARED DOMAIN OVERRIDE
If the work is identified as pattern/textile design or 
background/support design, declare it here and carry it forward. 
Step 5 will confirm the pattern redirect rather than detect it, and 
the Hierarchy Adjustments in Step 4 will be reframed accordingly.

PATTERN AND TEXTILE DESIGN: Non-hierarchical, equal-weight signals 
that refuse to resolve are the intended output. The work succeeds 
precisely because no single element wins. Redundancy without 
reinforcement keeps the eye moving without landing—which is what a 
repeating ground needs to do.

BACKGROUND AND SUPPORT DESIGN (packaging, advertising, editorial): 
The work is designed to subordinate itself to a dominant element not 
present in the image—typography, product, photography. What reads as 
false resolution or weak bid strength here is intentional 
load-shedding. The background is winning by not competing.

If either of these applies, invert the Interference Patterns 
diagnosis in Step 2: note which patterns are present, confirm they 
are operating as intended, and identify any accidental hierarchy that 
threatens the design's primary function.

---

STEP 1: INVENTORY THE ACTIVE PRINCIPLES

List the perceptual principles visibly operating in this work. 
For each, note:
- Its operating range (room-scale / mid-distance / close approach)
- Its approximate bid strength (strong / moderate / weak)
- What it is asking the viewer to do

---

STEP 2: DIAGNOSE THE INTERFERENCE

For each pair or group of principles identified, determine which of 
the following is occurring:

CANCELING CONFLICT
Two principles pulling against each other at equal weight with no 
hierarchy. Neither wins. Viewer attention stalls. Name the two 
principles and confirm no structured hierarchy exists between them.

REDUNDANCY WITHOUT REINFORCEMENT
Multiple principles restating the same information without extending 
it. The second observation confirms the first but adds nothing. Name 
the repeated signal and confirm it builds no new territory.

FALSE RESOLUTION
The work settles accurately but shallowly. Correct identification, 
no reward. The viewer's attention market clears too fast. Name what 
settles and what fails to open after settlement.

REGISTER MISMATCH
A principle operating at the wrong scale for its content. A 
room-scale bid on close-range content. A subtle signal deployed 
where loudness is needed to establish permission to approach. Name 
the principle and its mismatched range.

If none of the above apply to a given principle or pairing, note it 
as COHERENT and move on.

---

STEP 3: IDENTIFY WHAT TYPE OF UNRESOLUTION IS PRESENT

Productive irresolution: deferral with a legible reward signal. 
Viewer stays because staying promises accumulation.

Noise irresolution: deferral without that signal. Attention loops 
without accumulating.

Name which type dominates this work, and what specific visual 
evidence supports that reading.

---

STEP 4: HIERARCHY RESTORATION

For each interference pattern identified, suggest one adjustment. 
The adjustment must:
- Name which principle to subordinate or remove
- State what relationship it restores
- Require no new elements—only rebalancing of what is already present

Do not prescribe. Restore hierarchy.

Note: if a Declared Domain Override is in effect from Step 0, 
reframe these adjustments accordingly—the goal is not to restore 
hierarchy but to identify any accidental hierarchy that works against 
the design's primary function.

---

STEP 5: PATTERN / TEXTILE REDIRECT

If the interference patterns identified in Step 2 include two or 
more of the following—and no Declared Domain Override is already 
in effect—assess whether this work has unintentional pattern 
potential:

- Redundancy without reinforcement → all-over rhythm; eye travels 
  without landing; repeat-friendly
- Canceling conflict at equal weight → no dominant focal point; 
  distributes evenly across a field; works as non-directional print
- False resolution via flat fill → graphic clarity at reproduction 
  scale; holds at distance and in repeat
- Register mismatch (quiet lines over loud masses) → natural layered 
  print structure; lines function as secondary color layer over ground

If two or more are present, add the Pattern Redirect block to the 
output.

---

OUTPUT FORMAT

Noise Audit: [work or image identifier]

Domain: [perceptual / conceptual / cultural — primary named, others 
listed. If conceptual or cultural is primary, one-line note that the 
perceptual analysis describes one dimension, not a verdict.]

Active Principles: [list with range and bid strength]

Interference Patterns Found:
[type] — [which principles] — [what it prevents]

Dominant Unresolution Type: [productive / noise] — [evidence]

Hierarchy Adjustments:
[adjustment] → [relationship restored]

Pattern Redirect: [if triggered — which interference patterns double 
as pattern virtues, what repeat structure the composition suggests, 
what would need to change, what should be preserved exactly as-is. 
Omit this block entirely if not triggered.]

Summary: One sentence. What single change would most increase the 
reward signal for a viewer who stays.
```

---

## Open Architecture Question

**Problem:** The prompt is hitting the context ceiling before completing, especially with complex images. The basePrompt in `analysisModes.js` is long, and the Noise Audit steps 0–5 plus detailed image analysis exceed the token limit before reaching the Summary.

**Option A: Two prompt cards**
- Card 1 — Diagnostic: Steps 0–3 (domain ID, principle inventory, interference patterns, unresolution type)
- Card 2 — Adjustments: Steps 4–5 (hierarchy restoration, pattern redirect)

Workable now. No architecture changes needed. Cards don't chain — each restarts fresh with only the image in context, so Card 2 re-derives some of Card 1's work internally.

**Option B: Four or five cards (one per step or step-group)**
Would go significantly deeper per section, but only works if the upload page can thread prior card output as context into subsequent calls. Otherwise each card just re-analyzes from scratch — redundancy without genuine depth stacking.

**Decision needed:** Can `ai-analyze.astro` pass a prior card's output as context into the next card's API call? If yes, 4–5 cards becomes genuinely more powerful. If no, two cards is the right call.

**Recommendation:** Check the architecture with a look at `src/pages/hidden-grammar/ai-analyze.astro` and `src/pages/api/analyze-artwork.ts` before deciding card count.

---

## Naming Question

"Noise Audit" — accurate to the core mechanism, memorable, doesn't oversell.

"Signal Audit" — broader, covers what's transmitting AND what's interfering, and what domain the transmission is aimed at. More accurate to what the mode does now that domain identification is part of it.

Decision deferred. Use Noise Audit for now.
