# Claude Code Kickoff—The Grammar of Things

Run these in order. Each **PROMPT** block is copy-paste for Claude Code. Each **YOU** block is a dashboard step you do yourself. After each Claude Code prompt, check the stated result before moving on.

Reference docs (copy both into the new repo first—see Prompt 1): `GRAMMAR_OF_THINGS_BUILD_BRIEF.md` and `agent_docs/pattern-catalog-first-ingestion.md`.

---

## Step 1—Scaffold the new site (Claude Code)

> **PROMPT:**
> Create a new Astro project in this empty repository for a site called The Grammar of Things, configured to deploy on Cloudflare Pages.
>
> - Use Astro with TypeScript and the `@astrojs/cloudflare` adapter in server (SSR) mode, since later work adds API endpoints.
> - Add a single placeholder homepage that renders the text "The Grammar of Things—coming soon" (use the full official name with "The") so I can confirm deployment.
> - Set up a clean, conventional folder structure, a sensible `.gitignore`, and a short README stating this is a standalone site (it does NOT share code, tokens, or layouts with the Artists Are Jerks repo).
> - Add a `docs/` folder and copy in the two files I'm providing: the build brief and the catalog-first pattern doc. Treat the build brief as the authoritative spec for all later work.
> - Confirm `npm run build` succeeds and tell me the exact Cloudflare Pages build settings to use (build command and output directory).
>
> Do not build any features yet. This step is only a deployable skeleton.

**Check:** `npm run build` succeeds; there's a placeholder homepage. (Copy `GRAMMAR_OF_THINGS_BUILD_BRIEF.md` and `agent_docs/pattern-catalog-first-ingestion.md` from the AAJ repo into this repo before running, so Claude Code can place them in `docs/`.)

---

## Step 2—Connect to Cloudflare (YOU, dashboard)

> **YOU:**
> 1. Push the new repo to GitHub.
> 2. In Cloudflare: Workers & Pages → Create → Pages → Connect to Git → pick the repo. Build command `npm run build`, output directory `dist` (use whatever Claude Code reported if different).
> 3. Deploy. Confirm the `*.pages.dev` URL shows the placeholder. **This is your dev site.**
> 4. In the Pages project → Settings → Environment variables, add `ANTHROPIC_API_KEY` with your key.

---

## Step 3—Port the analysis engine (Claude Code)

> **PROMPT:**
> Port the artifact analysis engine from the Artists Are Jerks repo into this one as a standalone API.
>
> - Source: `src/pages/api/artifact.ts` and the principle/data files it imports (the 27 Pass-1 principles and any tier data). I will paste these files if you cannot read them directly.
> - Bring over the four-pass logic and all prompt constants unchanged: `PASS1_PROMPT_*`, `ARTIFACT_PROMPT`, `CONNECTIONS_PROMPT`, `COMPETENCY_PROMPT`, `EXTRACTION_PROMPT`, and the vector scoring.
> - Do NOT bring over any Artists Are Jerks design tokens, layouts, `analysisModes.js`, or Hidden Grammar Zone A/B structure. Only the engine and its data.
> - Wire it as an API endpoint that reads `ANTHROPIC_API_KEY` from the Cloudflare runtime env, matching how the original does it.
> - Keep analytical behavior identical—this is a move, not a redesign.
>
> Confirm the build succeeds and the endpoint is reachable.

**Check:** Build passes; the analysis endpoint exists in the new repo.

---

## Step 4—Centralize model selection / Brief A2 (Claude Code)

> **PROMPT:**
> Implement Part A2 of `docs/GRAMMAR_OF_THINGS_BUILD_BRIEF.md` (centralize model selection), and set up the A3 seam at the same time. Replace every hardcoded `claude-sonnet-4-6` string with a single per-pass config whose entries are `{ provider, model }`, default extraction to a Haiku model, and allow overrides via environment variables read from the Cloudflare runtime env. Route every model call through one internal model-router function rather than calling the provider SDK directly at each pass—even though only Anthropic is wired today. Do not integrate any other providers yet. Change nothing about prompt wording, pass order, or vector scoring. Follow the acceptance checks for A2 and A3 in the brief.

**Check:** Changing one env value reroutes one pass to a different model, confirmed in the API response's `model` field.

---

## Step 5—Prompt caching / Brief A1 (Claude Code)

> **PROMPT:**
> Implement Part A1 of `docs/GRAMMAR_OF_THINGS_BUILD_BRIEF.md` (prompt caching). Separate the large static instruction text from per-artifact dynamic text so the cached prefix is byte-identical across runs, and add `cache_control` breakpoints on the static blocks, chiefly Pass 2 and Pass 3. Verify no per-artifact value leaks into the cached prefix. Follow the acceptance check: running the same artifact twice should show a high `cache_read_input_tokens` on the second run.

**Check:** Second run of the same artifact reports cache reads and lower input cost.

---

## Step 5b—Pick the canonical vision model (optional but recommended, Claude Code + you)

Once the model-router seam (Step 4) exists, you can choose your canonical fingerprinter on evidence instead of assuming. Use the harness prompt in `agent_docs/eval-vision-fingerprinter-selection.md` to build the eval tool, run a 12–20 image set across 2–4 candidate models, and pick the winner by consistency and discrimination. Set that model as the Pass 1 default before building the corpus, so every object is fingerprinted by the same chosen model. Can be done now or deferred until just before real cataloging begins—but before the corpus grows.

---

## Step 6—Data model / Brief C1 + C1a (Claude Code)

> **PROMPT:**
> Implement the data model in Part C1 and C1a of `docs/GRAMMAR_OF_THINGS_BUILD_BRIEF.md`. One Object → one canonical blind fingerprint (stored as an ordered numeric vector, not flat columns) → many analyses. Documentation in three layers: raw verbatim, AI-split JSON, AI-canonical fields, stored as JSON (D1/SQLite is fine for now). Promote EZID/ARK, catalog number, accession number, and the canonical attribution claim to first-class columns. Do not assume one object equals one analysis. Do not build the cross-object query layer—only make the schema able to support it later.

**Check:** A migration/schema exists matching the brief; an object can hold many analyses; the fingerprint is stored as a vector.

---

## Step 7—Ingestion pipeline / Brief C2 (Claude Code)

> **PROMPT:**
> Build the one-object catalog/ingest path in Part C2 of `docs/GRAMMAR_OF_THINGS_BUILD_BRIEF.md`. A single-object upload with image(s) plus a paste field for documentation. Run two independent tracks: Track A stores the original image untouched, derives a normalized analysis copy (long edge ~1568px, high quality, same spec every time), and runs Pass 1 blind on the copy to produce the fingerprint; Track B stores the raw documentation verbatim, AI-splits it to JSON, and AI-maps it to canonical fields. The documentation must never enter the Pass 1 context. No Pass 2/3/4 here. An empty documentation field is valid. Follow the artifact-preservation rules exactly.

**Check:** Cataloging one real object (try the Smithsonian Mimbres bowl) stores the original, a fingerprint vector, and the three documentation layers—without running a full analysis.

---

## Step 8—Analysis path / Brief C3 (Claude Code)

> **PROMPT:**
> Build the on-demand analysis path in Part C3 of `docs/GRAMMAR_OF_THINGS_BUILD_BRIEF.md`. Recall a cataloged object (image plus documentation), run a chosen prompt (Pass 2/3/4 or custom) with documentation available as context, and store the output and its scored vector as a new Analysis against the same object. Where applicable, compare the blind fingerprint against the documented attribution claim and surface a mismatch as a research flag—presented as a flag, never asserted as a conclusion.

**Check:** Running an analysis on the cataloged bowl produces stored output linked to the object, plus a fingerprint-vs-claim comparison.

---

## Step 9—Site structure / Brief Part B (Claude Code)

> **PROMPT:**
> Build the site structure in Part B of `docs/GRAMMAR_OF_THINGS_BUILD_BRIEF.md`. Start with the fixed core sections in this order: the problem, the proof (built around the cataloged Mimbres bowl, showing epistemic labels, RAP flags, and the fingerprint), how it works, and the roadmap/what-funding-builds. Build the modular hero and credibility sections last, keeping their content in dedicated data files so the framing can swap per funder (first target: IMLS museum framing). Use a new visual identity—do not import Artists Are Jerks tokens or components.

**Check:** The dev URL shows the four fixed sections; the hero content is in a swappable data file.

---

## Notes

- Out of scope for all of v1: the cross-object query layer ("tensor query"), OCR, the real retrieval corpus, and the PostgreSQL/pgvector migration. Build the seam, not the contents.
- Point your Namecheap domain at Cloudflare anytime; attach the real domain in Pages only when you're ready to go public (the dev `.pages.dev` URL carries you until then).
