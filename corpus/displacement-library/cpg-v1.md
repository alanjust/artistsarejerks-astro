# CPG Displacement Block — v1

**Domain:** Consumer Packaged Goods / Commercial Packaging
**Version:** 1
**Date:** May 2026
**Status:** First draft — not yet tested against actual images
**Built from:** corpus/cpg/

---

## How to use this block

This block goes into Pass 2 of a Hidden Grammar analysis. Pass 1 runs first,
without this block—it produces the universal perceptual inventory using the
54 Principles. Pass 2 takes the Pass 1 output and routes it through this block
to produce a tradition-calibrated evaluation.

Insert the full block below into the Pass 2 system prompt. Complete the routing
fields before running.

---

## The block

---

### Step 1 — Displacement (always first)

Do not apply fine art critical frameworks, formalist criteria, or museum/gallery
discourse to this analysis. Do not assess this packaging for tension, ambiguity,
productive friction, or sustained perceptual reward. These are not operative
criteria in commercial packaging evaluation.

Do not apply design community standards of excellence—typographic elegance,
formal innovation, aesthetic refinement, or award-worthiness by D&AD, Cannes
Lions, Clio, or Dieline standards. Designer admiration and peer recognition are
not indicators of commercial quality or packaging success.

Do not assess this work the way a viewer assesses a painting or sculpture.
Packaging is assessed at 3–5 feet, at speed, in peripheral vision, by a shopper
who will spend 3–7 seconds in front of this category. Evaluate accordingly.

---

### Step 2 — Routing (complete before continuing)

Identify before evaluating:

**Commercial objective:**
[ ] Drive trial — reach new buyers, encourage first purchase
[ ] Serve loyal buyers — navigation, recognition, equity reinforcement
[ ] Reposition — signal change while retaining loyal buyer recognition
[ ] Communicate premium — justify higher price point
[ ] Communicate value/entry — accessibility, category clarity
[ ] Launch new brand — establish distinctive assets from zero

**Brand stage:**
[ ] Legacy brand (has existing distinctive assets—protect or evolve deliberately)
[ ] New entrant (must build assets from scratch—prioritize uniqueness and consistency)

**Category context: (what is it?)**
[ ] Note what visual conventions dominate this category
[ ] Note whether conforming to or disrupting conventions serves the objective

---

### Step 3 — Redirect

Analyze this packaging using the evaluative framework of shopper marketing and
brand strategy. The primary framework is Byron Sharp's mental and physical
availability model (Ehrenberg-Bass Institute) and Jenni Romaniuk's distinctive
brand assets framework.

**Evaluate against these criteria, weighted by the routing above:**

**Shelf visibility and category navigation**
Can a shopper locate this package in its category at 3–5 feet within 3 seconds?
Does it correctly signal category membership? Does it stand out from or conform
to category visual conventions—and is that the right choice given the objective?

**Brand identification speed**
Can a shopper who knows this brand identify it within 2 seconds without reading
the wordmark? Which visual elements carry the identification load? Are these
elements distinctively owned by this brand or shared with the category?

**Communication hierarchy**
At 3 feet: brand identity and category placement.
At 2 feet: variant identification (flavor, size, format).
In hand: reason to believe, benefit claim, proof.
Is this sequence intact? Where does it break down?

**Distinctive asset evaluation — apply the fame-uniqueness matrix**
For each primary visual element (color, shape, symbol, typography, structural form):
- Is this element well-known among category buyers? (fame)
- Is this element distinctively associated with this brand vs. the category? (uniqueness)
- Is it an owned asset (high/high), a category cue (high/low),
  a potential future asset (low/high), or generic (low/low)?
- Are owned assets reinforced or eroded by this design?

**Commercial objective fit**
Given the stated objective from the routing step, does this package do the right job?
Apply the relevant criteria from corpus/cpg/evaluative-criteria.md.

---

### Step 4 — Reference class

Treat high-market-performing packages as your primary reference class. Examples:

- Heinz ketchup — distinctive asset consistency across decades and format changes
- Tide (P&G) — asset protection under design pressure; recognition over aesthetics
- Coca-Cola — the upper bound of distinctive asset strength
- Heineken — cross-market asset coherence
- Kind Bar — structural solution to a specific communication problem
- Morton Salt — the compounding value of consistency alone

Counter-case (use as a failure benchmark):
- Tropicana (2009) — critically praised redesign; sales dropped 20% in 6 weeks;
  reverted within 2 months. Canonical example of distinctive asset erosion.

Do not use Pentagram work, D&AD winners, or Cannes Lions packaging winners as
the primary reference class unless they are also documented market performers.

---

## Refinement log

**v1 (May 2026):** First draft. Not yet tested against actual packaging images.
The displacement section addresses fine art and design community defaults.
Suspected drift risks: model may still reference Pentagram or award-winning work
as reference class despite redirect; model may apply "premium" criteria from
fine art tradition rather than CPG-specific premium signals. Watch for these
on first test run.

**Next:** Test against 3–5 actual CPG packages across different categories and
objectives. Note any drift that survives this block. Record here as v2 additions.

---

## Related corpus files

- `corpus/cpg/critics-and-frameworks.md` — the three frameworks and why two are displaced
- `corpus/cpg/canonical-works.md` — the reference class with explanations
- `corpus/cpg/evaluative-criteria.md` — full criteria organized by type and objective
- `corpus/cpg/source-extracts.md` — primary source vocabulary to draw on
