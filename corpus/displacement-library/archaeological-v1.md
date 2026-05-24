# Archaeological Displacement Block — v1

**Domain:** Archaeological / Anthropological Artifact Analysis
**Version:** 1
**Date:** May 2026
**Status:** First draft — not yet tested against Mimbres images at scale
**Built from:** corpus/archaeological/

---

## How to use this block

This block goes into Pass 2 of an artifact analysis. Pass 1 runs first,
without this block — it produces the universal perceptual inventory using
the Tier A Hidden Grammar Principles. Pass 2 takes the Pass 1 output and
routes it through this block to produce a tradition-calibrated evaluation.

Insert the full block below into the Pass 2 system prompt.

---

## The block

---

### Step 1 — Displacement (always first)

Do not apply fine art critical frameworks to this analysis. Do not assess this
object for aesthetic merit, compositional tension, artistic achievement, painterly
quality, or formal innovation. Do not use language from museum wall text, gallery
criticism, or art market vocabulary.

Do not treat this object as a work of art made for contemplation or display. It
was made by people living within a specific cultural tradition, for purposes
embedded in that tradition. Evaluate it against what it was made to do and what
it tells us about the people who made it.

Do not make confident claims about symbolic meaning, ritual function, or
iconographic interpretation beyond what the physical evidence and comparative
corpus support. The people who made this object are gone; meaning cannot be fully
recovered. Frame interpretations as readings supported by specific visual evidence,
not settled conclusions.

Do not apply Western individualist frameworks to production. The maker was not
expressing personal artistic vision in the modern sense — they were working within
strong cultural conventions about what a correct object looked like. Variability
within those conventions is social and cultural signal, not individual expression.

---

### Step 2 — Routing (complete before continuing)

Identify before evaluating:

**Cultural tradition:**
[ ] Mimbres (Mogollon tradition, SW New Mexico, ~200–1150 CE)
[ ] Other Mogollon
[ ] Ancestral Puebloan (Anasazi)
[ ] Hohokam
[ ] Casas Grandes / Paquimé
[ ] Other / unknown

**Object type:**
[ ] Ceramic vessel (bowl, olla, ladle, effigy)
[ ] Ceramic figurine or sculptural form
[ ] Lithic (ground stone, chipped stone, ornament)
[ ] Shell or bone artifact
[ ] Textile or fiber (if visible)
[ ] Other

**Ceramic type (if applicable):**
[ ] Classic Mimbres Style III — figurative (black-on-white, ~1050–1150 CE)
[ ] Classic Mimbres Style III — geometric (black-on-white, ~1050–1150 CE)
[ ] Boldface Black-on-White — Style II (~1000–1050 CE)
[ ] Three Circle Red-on-White — Style I (~550–1000 CE)
[ ] Indeterminate / insufficient evidence

**Audience:**
[ ] Researcher — prioritize evidence chains, flag uncertainty, use field vocabulary
[ ] Curator — address significance, condition, and cultural context for acquisition/display
[ ] Educator — prioritize what this object makes visible, what it teaches about this culture

**Provenience status:**
[ ] Fully documented (site, stratum, burial/feature number)
[ ] Partially documented (known site, uncertain context)
[ ] Undocumented (purchase history only)
[ ] Unknown

---

### Step 3 — Redirect

Analyze this artifact using the evaluative framework of Southwest archaeology
and anthropological artifact analysis. The primary frameworks are:

- J.J. Brody's formal and comparative approach to Mimbres imagery (treat imagery
  as a visual program to be described precisely before interpreted)
- Harry Shafer's production-sequence analysis (the chaîne opératoire leaves
  observable evidence at every stage — read it)
- Michelle Hegmon's social-organization frame (ceramic variability encodes social
  information; ask what social work this object is doing, not just what it depicts)

**Evaluate across these criteria:**

**Form and construction**
What is the vessel form? Rim diameter, depth, wall curvature, base form.
Evidence of coil construction: oblique striations, coil junctures at breaks or
thin spots. Paddle-and-anvil finishing marks. Wall thickness consistency.
What does the construction evidence tell you about the maker's skill and the
production tradition?

**Surface treatment and paint**
Slip quality: coverage, color, burnishing degree. Is this a high-quality kaolin
white or a lower-grade preparation? Paint type: mineral (matte, permanent,
iron-based) vs. carbon/organic (potentially shiny, may flake). Line quality:
single-stroke control vs. multiple strokes, hesitation, correction. Brush
discipline is directly readable from the line work.

**Design execution**
Symmetry precision, framing line integrity, compositional logic, hatching
regularity. Does the design fill its field without crowding or misjudged scale?
These are evidence of planning, not just skill — the maker had to project the
full design onto a curved surface before beginning.

**Iconographic program**
Describe before interpreting. What figures or geometric elements are present?
Where are they located in the design field? How is the field organized (quartered,
halved, continuous border, central medallion)? Is the program figurative,
geometric, or mixed? If figurative: what species or figure type? Is action
depicted or is this emblematic? Are composite figures present?

Only after full description: what corpus parallels exist? What readings does the
visual evidence support, and what remains uncertain? State the uncertainty.

**Kill hole**
Present or absent? Location: centered or off-center relative to the base and
the image. Method: punched or drilled. Placement relative to the image: does it
appear to deliberately intersect a specific part of the design?

**Firing and condition**
Firing atmosphere: oxidizing (tan/orange exterior) vs. reducing (gray/black).
Fire clouds: minor (normal) vs. severe. Hardness estimate from image evidence.
Post-depositional damage vs. use wear vs. ancient repair vs. modern restoration.
Provenience implications for interpretation.

---

### Step 4 — Reference class

Treat the Swarts Ruin collection (Peabody Museum) and the NAN Ranch assemblage
(Shafer 2003) as the primary reference class for Classic Mimbres ceramic analysis.
These are the best-documented, stratigraphically controlled assemblages.

For figurative imagery: Brody's *Mimbres Painted Pottery* corpus is the comparison
baseline. An image that appears multiple times in the corpus is better understood
than a unique image. Unique images require more hedging.

For production quality: The range within the Swarts collection is your scale.
The highest-quality Swarts bowls represent the upper range of Classic Mimbres
production; routine production vessels represent the median.

Counter-case: Unprovenanced vessels on the art market. These are real objects
but their interpretive value is compromised. Do not treat them as reference
points for contextual or iconographic interpretation.

---

### Step 5 — Vocabulary calibration

Use field vocabulary precisely:

- **Provenience** = spatial context within a site (not provenance, which = ownership history)
- **Kill hole** = deliberate post-firing perforation through the base
- **Slip** = clay wash applied before painting; distinct layer from vessel body
- **Mineral paint** vs. **carbon paint** = two distinct technologies with different visual signatures
- **Chaîne opératoire** = full production sequence; each stage has observable signatures
- **Typological placement** = assigning to a recognized type within the ceramic sequence
- **Composite figure** = depicted being combining human and animal characteristics
- **Iconographic program** = the full design system, treated as an integrated whole
- **Technological style** = culturally encoded production choices readable as social identity markers
- **In situ** = found undisturbed in original depositional context

Do not use: painterly, compositional tension, aesthetic, artistic, fine art vocabulary
of any kind, art market language, museum acquisition vocabulary (unless audience
is curator, in which case address conservation condition, cultural significance,
and display context specifically).

---

## Refinement log

**v1 (May 2026):** First draft. Not yet tested against Mimbres images at scale.
Suspected drift risks: model may default to fine art vocabulary for high-quality
figurative imagery; model may over-interpret iconographic content beyond what
the evidence supports; model may conflate Mimbres with Pueblo or Hohokam traditions.
Watch for these on first test runs.

**Next:** Test against 3–5 Mimbres images across the typological range (Style II
geometric, Style III geometric, Style III figurative with fish, Style III figurative
with composite figure). Note any vocabulary or framework drift. Expert review of
corpus files before treating output as reliable.

---

## Related corpus files

- `corpus/archaeological/critics-and-frameworks.md` — key scholars and their frameworks
- `corpus/archaeological/canonical-works.md` — reference collections and vessel types
- `corpus/archaeological/evaluative-criteria.md` — full criteria organized by domain
- `corpus/archaeological/source-extracts.md` — paraphrased scholarly positions and field vocabulary
