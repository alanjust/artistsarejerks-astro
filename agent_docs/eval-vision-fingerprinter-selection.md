# Eval Protocol—Selecting the Canonical Vision Fingerprinter

**Purpose:** Choose, on evidence, the single vision model that computes the canonical Pass 1 fingerprint for the whole corpus. Do not pick by benchmark rank—public vision leaderboards measure chart/OCR/document tasks, not fine perceptual discrimination. Test on the real task.

**Prerequisite:** the engine is ported and the A2/A3 model-router seam exists, so Pass 1 can run on different models by config alone.

**Bonus:** this harness is also the A3 cross-check layer in embryo, and the run is a defensible methods artifact for a grant ("vision model selected empirically against expert-validated criteria").

---

## What the fingerprinter must be good at (in priority order)

1. **Consistency (test–retest reliability).** Same image, repeated runs → near-identical 27-dim vector. A drifting fingerprint is useless for outlier detection. Highest weight.
2. **Discrimination (validity).** Different objects → clearly different vectors; the same object photographed twice → nearly the same vector. Within-object distance must be much smaller than between-object distance.
3. **Faithfulness.** Describes what is present; does not confabulate detail. A confident hallucinated feature is worse than an honest "cannot tell."
4. **Instruction discipline.** Stays in pure observation during Pass 1; does not leak interpretation or cultural attribution. The blindness must hold.

## Image set design (12–20 objects)

Assemble a small, deliberate set—not random:

- **Repeat pairs (3–5 objects):** the same object in two different photographs (different angle/lighting), OR the same photo submitted twice. Tests consistency and same-object proximity.
- **Clear contrasts (4–6 objects):** objects that any trained eye would score very differently (different forms, traditions, surface treatments). Tests discrimination at the easy end.
- **Near neighbors (3–5 objects):** objects that are genuinely similar. Tests discrimination at the hard end—where the instrument earns its keep.
- **Expert-anchored (2–4 objects):** objects your partner can give a ground-truth read on, for face-validity checks.

Keep the same image set fixed across all candidate models so comparisons are fair.

**Where to source the images:** open-access museum collections, not general image corpora. The eval's power comes from a curated, structured set (repeat pairs, contrasts, near neighbors, expert-anchored)—not from volume—so large training datasets (e.g. GPIC and similar generic web-image corpora) are the wrong tool here. Pull real artifact photography from collections like the Smithsonian (NMNH, already in use) and other open-access museums (e.g. the Met) and curate the dozen-plus set by hand. AI-generated captions in such datasets are not ground truth and must not be used as reference labels.

## Procedure

1. Pick 2–4 candidate models (e.g. Claude Sonnet, Claude Opus, a current GPT vision model, Gemini; add an open model like Qwen-VL only if data sovereignty is in scope).
2. For each model, run **Pass 1 only**, **3–5 times per image**, same prompt, same normalized image spec (long edge ~1568px, as in the brief).
3. Record every run's 27-dim vector and the raw Pass 1 text.

## Metrics (compute per model)

- **Consistency score:** for each image, average pairwise distance between its repeat-run vectors (Euclidean or cosine over the 27 dims). Average across images. **Lower is better.**
- **Same-object proximity:** for each repeat pair, distance between the two photos' mean vectors. Should be small—comparable to consistency, not to between-object distance.
- **Discrimination ratio:** (mean between-different-object distance) ÷ (mean within-object / repeat distance). **Higher is better**—this is signal-to-noise. A ratio near 1 means the model can't tell objects apart above its own noise.
- **Hallucination / face-validity count:** expert reviews a fixed sample of Pass 1 texts per model; count invented features and scoring calls that contradict a trained eye. **Lower is better.**
- **Discipline violations:** count Pass 1 outputs that leak interpretation or attribution. **Lower is better.**
- **Cost per fingerprint:** record actual token cost per model.

## Decision rule

Rank candidates by consistency and discrimination ratio first (these are the fingerprint's whole reason to exist), gate on acceptable hallucination/discipline counts (a model that confabulates or won't stay blind is disqualified regardless of its numbers), then break ties on cost. The winner is the canonical fingerprinter. Because the canonical fingerprint is computed once per object and everything downstream rests on it, paying more for the best model on this one pass is justified even if cheaper models run the later passes.

Re-run this eval when a materially newer model appears or the corpus grows enough to expose new failure modes.

---

## Claude Code task to build the harness

> **PROMPT:**
> Build a small offline evaluation harness (a script, not part of the live site) that selects the canonical Pass 1 vision model, per `docs/eval-vision-fingerprinter-selection.md`.
>
> - Input: a folder of test images (with a simple manifest marking repeat pairs and object groups) and a list of candidate models expressed as the `{ provider, model }` config used by the model-router.
> - For each candidate model, run Pass 1 only via the existing model-router, N times per image (configurable, default 4), using the same normalized image spec as ingestion.
> - Store every run's 27-dim vector and raw Pass 1 text to disk.
> - Compute and print a per-model report: consistency score, same-object proximity, discrimination ratio, and cost per fingerprint, as defined in the protocol doc. Leave hallucination and discipline counts as a column for manual expert entry.
> - Do not touch the live ingestion or analysis paths. This is a standalone measurement tool.
>
> Output a single comparison table across models plus the raw per-run data for inspection.
