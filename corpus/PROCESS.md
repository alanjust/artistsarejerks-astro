# Corpus Process Manual

**What this document is:** A complete guide to building, using, and maintaining the
Hidden Grammar corpus system. Written for someone starting from zero — including
yourself, six months from now, or a partner or assistant who wasn't in the room when
this was built.

**Read this before touching any file in this folder.**

---

## Part 1 — Understanding the system

### Why this exists

LLMs drift to the mean of their training data. For image analysis, that mean is
fine art critical vocabulary — the language of museum catalogs, art history texts,
and gallery criticism. This is the dominant signal in the training corpus.

The problem: most visual work is not fine art. When an LLM evaluates a CPG package,
a Shaker chair, an Iznik tile, or a Neolithic ceramic vessel using fine art criteria,
it reads the work's virtues as failures. Surface resolution becomes "lack of tension."
Harmony becomes "absence of depth." Commercial legibility becomes "aesthetic naivety."
This isn't malice — it's gravity.

The corpus system is an intervention against that gravity. It provides the raw
material to redirect an LLM away from its default and toward the correct evaluative
tradition for a given domain. The result is analysis that actually measures a work
against the criteria that matter for what the work is trying to do.

### The two parts of the system

**The corpus** is the raw material: primary sources, critics, canonical works, and
evaluative vocabulary organized by domain. It's what you read to understand a
domain's own evaluative tradition.

**The displacement library** is the tested output: prompt blocks that use the corpus
to redirect LLM analysis in practice. These blocks go into Pass 2 of a Hidden Grammar
analysis.

Think of the corpus as the research and the displacement library as the tool built
from that research.

### How Hidden Grammar analysis uses this system

Hidden Grammar analysis has two passes:

**Pass 1** runs a universal perceptual inventory using the 54 Hidden Grammar
Principles. No domain-specific content enters here. Pass 1 reads what is
perceptually present in the image — rhythm, tension, edge behavior, figure-ground
relationships — independent of tradition or intent. Pass 1 is always the same.

**Pass 2** takes the Pass 1 output and evaluates it through the lens of the
relevant domain. This is where the displacement block lives. The block tells the
LLM what default patterns to suppress, what tradition to evaluate against, and
what canonical works to use as the reference class.

Pass 1 answers: *what is here?*
Pass 2 answers: *what does it mean, given what this work is trying to do?*

---

## Part 2 — Folder structure

```
corpus/
  README.md               — one-page overview of the system
  PROCESS.md              — this document
  [domain]/
    critics-and-frameworks.md
    canonical-works.md
    evaluative-criteria.md
    source-extracts.md
  displacement-library/
    [domain]-v[n].md
    [domain]-addenda/
      [category].md
```

The `[domain]-addenda/` folder is optional. It exists only when a domain has
categories that recur frequently enough to warrant pre-built category context.
See Part 4B for when and how to create addenda.

**CPG example (currently built):**
```
displacement-library/
  cpg-v1.md
  cpg-addenda/
    spirits-premium.md
    beverage-functional.md
    grocery-staples.md
```

### What each file does

**`critics-and-frameworks.md`**
The key voices in this domain: who they are, what they argued, what their
evaluative criteria are, and what their work implies for analyzing images in
this domain. Also identifies which frameworks to displace and why. This file
is your research map.

**`canonical-works.md`**
The reference class: specific works that define the standard for this domain,
with explanations of what each case demonstrates. Includes instructive failures
— cases where something went wrong and why — because these are often more
useful than successes for understanding what matters.

**`evaluative-criteria.md`**
The observable success and failure criteria for this domain, organized by
criterion type and routing (what the work is trying to do). This is the most
directly useful file for building the displacement block. If you only read one
corpus file before building a block, read this one.

**`source-extracts.md`**
Direct quotes, key passages, and the specific vocabulary from primary sources.
The actual language the tradition uses. This file is the raw material for the
redirect language in the displacement block — not your paraphrase, but the
words the tradition itself uses to describe quality and failure.

**`displacement-library/[domain]-v[n].md`**
The tested prompt block for this domain, versioned. Contains: the displacement
move, the routing step, the redirect, and the reference class — plus a
refinement log documenting what each version fixed. This is what gets inserted
into Pass 2. The only file in the system that goes into a prompt directly.

---

## Part 3 — Creating a new domain

### Step 3.1 — Decide if a domain is ready to build

Build a domain when:
- There is a concrete use case. Someone is going to submit images from this domain.
- You can identify at least 2–3 primary sources.
- You can name a reference class — specific works that define the standard.
- The LLM default is demonstrably wrong for this domain.

Don't build domains preemptively. The CPG domain exists because there's a
commercial use case and a clear problem the default evaluation gets wrong.
Decorative arts exists because there's a museum/educational use case and a
substantial body of critical literature. Build when you need it.

### Step 3.2 — Run the domain mapping step

Before sourcing any texts, use an LLM to map the domain. This gives you a
research scaffold: who to read, what canonical works to study, what the
evaluative vocabulary looks like.

**Run these five prompts. Run them on at least two different LLMs.**
(Claude + one other — Gemini or GPT-4. Different training data means different
coverage. For specialized domains, the gaps matter.)

Prompt 1:
> "Who are the key critics, historians, and practitioners who developed the
> evaluative vocabulary for [domain]? Name their key texts and what each one
> contributes to the evaluative tradition."

Prompt 2:
> "What does success look like in [domain]? What specific, observable qualities
> do practitioners and critics use to assess quality — in the tradition's own
> terms, not imported from fine art or design community standards?"

Prompt 3:
> "What are the canonical examples in [domain] — specific works that define the
> standard? For each, what does it demonstrate about the tradition's values?"

Prompt 4:
> "What would a critic trained in [domain] identify as failure conditions?
> What does poor work look like in this tradition, and why?"

Prompt 5:
> "What evaluative criteria from fine art or mainstream design criticism do NOT
> apply to [domain], and why? What would constitute a category error in evaluating
> this kind of work?"

Compare the outputs from both LLMs. The overlaps are reliable. The differences
are worth investigating — one model may have meaningfully better coverage of a
specialized domain.

**Save the domain mapping output.** Don't discard it. It becomes the first draft
of `critics-and-frameworks.md` and the research list for Step 3.3.

### Step 3.3 — Source the primary texts

From the domain mapping output, you now have a list of critics and texts to find.
Prioritize based on what appears most frequently across both LLM outputs.

**Where to look:**

Public domain texts (free, full text):
- Project Gutenberg — gutenberg.org
- Internet Archive — archive.org (search by author and title; many 20th-century
  texts are available for borrowing or full access)
- HathiTrust — hathitrust.org (academic digitization; some full text, some
  restricted)

Academic papers:
- JSTOR — jstor.org (some free access; institutional access helps)
- Google Scholar — scholar.google.com (find papers; follow links to PDFs)
- Academia.edu — academia.edu (practitioners often self-archive here)
- ResearchGate — researchgate.net

Museum scholarship:
- V&A (Victoria and Albert Museum) — vam.ac.uk/collections
- Smithsonian — si.edu and collections.si.edu
- Cooper Hewitt Design Museum — collection.cooperhewitt.org
- Metropolitan Museum — metmuseum.org/art/collection
- These institutions often publish serious scholarly writing on their collections
  for free online. Search "[museum] + [domain] + research" or "[museum] + [artist/period] + essay"

Practitioner writing:
- Find the trade publications and journals for the domain
- Examples: Ceramics: Art and Perception; Surface Design Journal; American Craft;
  Textile Society of America; Dieline (for packaging — though note this skews
  toward design community values); Path to Purchase Institute (shopper marketing)

Books:
- Purchase, library, or find legally available digital copies
- For important texts, PDF sections can be uploaded directly for extraction

**For each source, note:**
- Author, title, year
- Where you found it
- Which chapters or sections are most relevant to evaluative criteria
- Whether the full text is available or only sections

### Step 3.4 — Extract from primary sources

For each source:

**Step A — Upload or paste the text into a conversation with Claude.**
For PDFs: upload directly. For web pages: paste the relevant sections.
For long books: upload chapter by chapter. The most relevant chapters are
usually the ones that explicitly state criteria — introductions, theoretical
sections, summary chapters.

**Step B — Run the extraction prompt:**

> "Extract every evaluative criterion from this text. What qualities does the
> author identify as marks of success or failure in [domain] work? List the
> specific terms and phrases the author uses — not paraphrase, the actual
> language. Group them by whether they describe form, material, process,
> function, or cultural meaning. Then identify the author's reference class:
> what specific works does the author hold up as examples of the best?"

**Step C — Review the output carefully.**
Check for three things:

1. **Accuracy.** Does what Claude extracted actually match what the text says?
   LLMs occasionally misread or confuse passages. If you've read the source,
   check against your memory. If not, spot-check a few passages by searching
   in the original.

2. **Relevance.** Not everything an author says belongs in your corpus file.
   Cut content that applies to fine art rather than the domain you're building,
   historical context that doesn't yield evaluative criteria, and biographical
   or bibliographic material.

3. **Completeness.** Did Claude miss anything important? If a concept you know
   is central to the source isn't in the output, prompt specifically for it.

**Step D — Write the curated results to the corpus.**
Tell Claude: "Write the curated extracts from [Author, Title] to
`corpus/[domain]/source-extracts.md`. Add under a new section heading with
the author and title."

Claude writes the file. The PDF has done its job. You don't need to store the
PDF in the workspace — store it in your personal references folder.

**Repeat for each source.** Source-extracts.md accumulates material across
multiple extraction sessions.

### Step 3.5 — Build the four corpus files

Build the files in this order. Each one feeds the next.

---

**File 1: `critics-and-frameworks.md`**

Built from: the domain mapping output (Step 3.2) plus what you learned sourcing
the texts.

What it contains:
- The key critics and practitioners, with brief notes on their core arguments
  and evaluative implications
- The primary frameworks that define this domain's evaluative tradition
- The frameworks to displace — fine art, design community, or others — named
  explicitly and with explanation of why they're wrong for this domain
- Any important tensions between frameworks within the tradition (not all
  domains have a single unified evaluative voice)

To build: ask Claude to draft this file from the domain mapping output and
the source material collected so far. Review and correct. Write to file.

---

**File 2: `canonical-works.md`**

Built from: the domain mapping output, the critics-and-frameworks file, and
direct research into which works are actually considered exemplary.

What it contains:
- Specific works (not categories — actual named examples) with explanations
  of what each one demonstrates about the tradition's values
- At least one instructive failure case — a work or redesign that failed, and
  what it shows about which criteria actually matter
- Notes on cases that require nuance (works that are admired but may not be
  good general benchmarks)

To build: draft from the mapping output and your own knowledge. Then ask Claude
to verify the examples and add any important ones that are missing. Review.
Write to file.

---

**File 3: `source-extracts.md`**

Built from: the extraction sessions in Step 3.4.

This file is built incrementally — each extraction session adds to it. It
doesn't get built in one sitting. By the time you're done sourcing and
extracting, this file should have material from at least 3–4 primary sources.

Structure: one section per source, headed with author and title. Direct
quotes and key concepts in the source's own language. Notes on evaluative
implications where helpful.

---

**File 4: `evaluative-criteria.md`**

Built from: all three files above, synthesized.

This is the most important file for building the displacement block. It
translates the research into actionable, observable criteria that can be
applied to actual images.

What it contains:
- A routing step — the questions that need answers before evaluation criteria
  can be applied (what is this work trying to do? what tradition does it
  operate in? what stage of development?)
- Criteria organized by type (form, material, process, function, cultural
  meaning — or whatever categorization makes sense for this domain)
- Explicit statement of what is NOT a criterion here — fine art and design
  community criteria named and ruled out
- Weighting notes where applicable — not all criteria matter equally for
  all work in a domain

To build: ask Claude to synthesize the other three files into a criteria
document. This will produce a first draft. Review carefully — this file
requires more editorial judgment than the others.

### Step 3.6 — Check the corpus before building the block

Before moving to the displacement library, run this check:

> "I've built a corpus for [domain]. Read all four files in `corpus/[domain]/`.
> Is anything important missing? Are there evaluative criteria I would want in
> a displacement block that the corpus doesn't yet support? Are there primary
> sources obviously absent from the source-extracts file that I should add?"

Fix any significant gaps before building the block. It's easier to add to
the corpus now than to rebuild the block later.

---

## Part 4 — Building the displacement block

### Step 4.1 — Draft the block

With the corpus complete, ask Claude to draft the displacement block:

> "Read all four files in `corpus/[domain]/`. Draft a displacement block for
> `corpus/displacement-library/[domain]-v1.md`. The block should have four
> components: the displacement move (what to suppress, specific to this domain),
> the routing step (what needs to be established before evaluation proceeds),
> the redirect (what evaluative tradition to use, drawing on the corpus vocabulary),
> and the reference class (which canonical works to use as benchmarks). Include
> a refinement log section at the bottom."

### Step 4.2 — Review the draft block

Check for four things:

1. **The displacement is specific enough.** "Don't use fine art criteria" is
   too blunt. The displacement should name the specific defaults that will
   appear for this domain. For CPG, that means naming the design community
   award structures and the specific fine art criteria (tension, ambiguity)
   that get misapplied to packaging.

2. **The routing step captures the real variables.** What actually changes
   how you evaluate work in this domain? For CPG, it's commercial objective,
   brand stage, and category context. For archaeological artifacts, it would
   be cultural context, functional purpose, and production period. The routing
   should surface the decisions that determine which criteria apply.

3. **The redirect uses the tradition's own vocabulary.** Check the language
   against `source-extracts.md`. If the redirect is using paraphrase rather
   than the actual terms the tradition uses, strengthen it.

4. **The reference class is specific.** Named works, not categories. "Japanese
   studio ceramics" is not a reference class. "Shoji Hamada's salt-glazed
   stoneware from the 1950s" is a reference class.

### Step 4.3 — Save and mark as untested

Save the block to `displacement-library/[domain]-v1.md`. The refinement log
should read: "v1 — first draft, not yet tested." Note suspected drift risks —
what you think might slip through based on your knowledge of the domain and
the LLM's default patterns.

---

## Part 4B — Creating category addenda

### What an addendum is

The base displacement block handles everything universal to a domain. An addendum
handles what changes for a specific category within that domain.

For CPG, the displacement (suppress fine art and design community defaults),
the redirect (Byron Sharp's framework), and the core criteria (shelf visibility,
brand ID speed, communication hierarchy, distinctive assets) are the same whether
you're analyzing a hot sauce or a premium gin. What differs is the category's
visual conventions and its relevant reference class.

An addendum is a short file — not a full displacement block — that pre-fills
the category-specific parts of the routing step and provides a category-targeted
reference class. It works alongside the base block, not instead of it.

### When to create an addendum

Create one when:
- A category recurs frequently enough that filling in the routing step from
  scratch each time is repetitive
- The category has a distinct visual convention set that differs meaningfully
  from the base block's generic examples
- You have multiple clients in the same category and want consistent context
  across analyses

Don't create one when:
- A client or category is a one-off — just fill in the routing step manually
- The category variation is minor — routing step notes are sufficient
- The evaluative criteria themselves change significantly — that signals a need
  for a sub-domain block, not an addendum

### What an addendum contains

An addendum has three parts only:

1. **Category context** — the dominant visual conventions for this specific
   category: what colors, structures, typographic approaches, and signals
   dominate the competitive shelf set

2. **Category reference class** — the specific market performers to compare
   against in this category, replacing or supplementing the generic reference
   class in the base block

3. **Category routing notes** — any routing step fields that are effectively
   pre-answered for this category (for example: in premium spirits, "Communicate
   premium" is almost always the commercial objective)

An addendum does NOT contain its own displacement move, redirect, or evaluative
criteria. Those live in the base block and the corpus files. The addendum only
handles what's category-specific.

### How to name and file addenda

Addenda live in a subfolder named `[domain]-addenda/` inside `displacement-library/`:

```
displacement-library/
  cpg-v1.md
  cpg-addenda/
    spirits-premium.md
    beverage-functional.md
    grocery-staples.md
```

File naming: `[category-descriptor].md`. Keep it short and obvious.
"spirits-premium" is clear. "client-xyz-gin-2026" is not — that's a project
file, not an addendum.

### Building an addendum

**Step 1 — Identify the category conventions.**
For a new category you haven't worked in before, run this prompt:

> "What are the dominant visual conventions for [category] packaging in the
> current US retail environment? What colors, structural forms, typographic
> approaches, and visual signals dominate the competitive shelf set? What
> does the category look like to a shopper approaching the shelf?"

Run on two LLMs and compare. For categories you've worked in before, you
likely already know the conventions — write them directly.

**Step 2 — Build the reference class.**
For the category-specific reference class, ask:

> "What are the highest-performing packages in [category] by market share and
> brand recognition — not by design awards? Name specific products and what
> each demonstrates about effective packaging in this category."

Verify any claims you're uncertain about. Market performance data changes.

**Step 3 — Note routing pre-answers.**
Look at the base block's routing step. Are any fields effectively the same
for every project in this category? If premium spirits projects almost always
involve a "Communicate premium" objective and a "Legacy brand" stage, note
that in the addendum so you're not re-entering it every time.

**Step 4 — Write and file the addendum.**
The addendum should be no longer than one page. If it's getting longer, you're
probably putting content in it that belongs in the corpus or the base block.

### How to use a base block and addendum together

In a Pass 2 analysis:

1. Open the base block (`cpg-v1.md` or current version)
2. Check whether a category addendum exists for this project's category
3. If yes: complete only the routing fields not pre-answered by the addendum
   (typically commercial objective and brand stage — the addendum handles
   category context)
4. Paste the base block into the Pass 2 prompt, then append the addendum
   directly below it
5. The addendum overrides the generic reference class from the base block
   with the category-specific one

**Example — analyzing a premium gin package:**

Routing fields to complete manually:
```
Commercial objective: [x] Communicate premium
Brand stage: [x] Legacy brand
Category context: → handled by spirits-premium addendum
```

Pass 2 prompt structure:
```
[Full text of cpg-v1.md]

---
CATEGORY ADDENDUM: PREMIUM SPIRITS
[Full text of cpg-addenda/spirits-premium.md]
```

The label `CATEGORY ADDENDUM: PREMIUM SPIRITS` tells the model that what
follows supplements the block above — it doesn't replace it.

### Versioning addenda

Addenda don't carry version numbers in the same way base blocks do. They're
lighter documents. If a category addendum needs updating — new market performers,
shifted category conventions — edit the file directly and note the update date
at the bottom. If changes are significant, add a brief note explaining what
changed and why.

If testing reveals that an addendum is actually causing the model to drift
(overriding something in the base block it shouldn't), that's a structural
problem — the addendum has content that belongs in the routing step, not its
own prompt block. Restructure rather than version.

---

## Part 5 — Testing the displacement block

Testing is the step that makes the system actually work. An untested block is
a hypothesis, not a tool.

### Step 5.1 — Gather test images

Find 3–5 actual images from the domain. Choose images that represent different
cases: different objectives, different sub-styles, different quality levels.
For CPG, that means packages with different commercial objectives (trial vs.
loyalty vs. premium). For craft, that means work from different traditions
within the domain.

### Step 5.2 — Run baseline (no displacement block)

Submit each image to Claude with only a basic analysis request — no domain
context, no displacement block. Just: "Analyze this image." Or use the Pass 1
prompt without Pass 2.

Save the output. This is your baseline — what the LLM does by default for
this type of image.

### Step 5.3 — Run with the displacement block

Submit the same images with the full Pass 2 block, routing step completed.
Compare to baseline.

**What to look for:**
- Does the model still use fine art vocabulary after displacement?
  (Words like: tension, ambiguity, productive friction, sustained perceptual
  reward, painterly, compositional — these indicate the fine art default
  survived the displacement)
- Does the reference class drift back to fine art or design community examples?
  (The model recommending you compare to a Pentagram project or a D&AD winner
  means the reference class instruction didn't hold)
- Are there domain-specific criteria that should be present but aren't?
  (The block may have a redirect gap — the model doesn't know what to say
  about a criterion that matters in this domain)
- Does the routing step produce the right calibration?
  (Is the evaluation actually weighted toward the stated objective?)

### Step 5.4 — Document everything in the refinement log

For every drift observed, write a specific note in the refinement log:

> "Model still applied [specific criterion] despite displacement. Evidence:
> [quote from output]. Fix: add explicit suppression targeting [criterion].
> Added in v2."

The refinement log is the institutional memory of the block. It records not
just what the current version does but what earlier versions got wrong and why.
This is the information you will need six months from now.

---

## Part 6 — Refining the block

### Step 6.1 — Add targeted suppressions

For each drift documented in testing:

1. Identify the specific language or pattern that slipped through.
2. Add a named suppression to the displacement section of the block.
   Generic suppressions ("don't use fine art criteria") don't catch specific
   drifts. Specific suppressions do.
   
   Example: if the model keeps using "minimalism" in a fine art Judd/Andre sense
   when evaluating Shaker furniture, add:
   > "Do not apply minimalist sculpture or fine art minimalism discourse to this
   > work. Shaker simplicity is functional and theological in origin, not aesthetic
   > in the fine art sense."

3. If the drift reveals a gap in the corpus (the redirect couldn't point the
   model anywhere useful because the relevant vocabulary wasn't in the corpus),
   add to the corpus first, then update the redirect.

### Step 6.2 — Version the block

Any time a suppression is added, a routing change is made, or redirect language
is significantly updated:

- Increment the version number in the filename (`cpg-v1.md` → `cpg-v2.md`)
- Add an entry to the refinement log noting what changed and why
- Note the date

Do not overwrite old versions. Keep the version history. If a new version
introduces a regression (it fixes one drift but causes another), you need
to be able to read the previous version to understand what changed.

### Step 6.3 — Retest after revisions

After any significant change to the block, retest with the same images used
in the original test. Confirm the drift is resolved. Confirm nothing new
broke. Update the refinement log.

---

## Part 7 — Using the system in an actual analysis

### A critical rule before you start

**Never edit the displacement block file during routine analysis.** The block
file is a template — it stays pristine. Do not open it, fill in the routing
fields, save it, and then go back and erase them when you're done. That's the
wrong workflow and will eventually corrupt the file.

The correct workflow: open the block file, copy all the text, paste it into
your conversation with Claude, fill in the routing fields in that pasted copy,
and submit. The file never gets touched. The filled-in routing lives only in
the conversation. When the analysis is done, it's done — there's nothing to
clean up.

The only reasons to open and save a block file are: adding a new suppression
(which creates a new version), correcting something in the block itself, or
updating the refinement log after testing. Routine analysis never touches the
file.

### The full workflow

**Before you start:** Know which domain the image belongs to. If it's ambiguous
(is this decorative arts or fine art? is this craft or archaeological?), that
ambiguity belongs in the routing step — note it explicitly.

**Pass 1:**
Submit the image with the Pass 1 prompt only. No domain context, no displacement
block. The output is a perceptual inventory: which of the 54 Principles are
active, which are in tension, which are absent. This is the raw evidence.

Example Pass 1 prompt:
> "Apply the Hidden Grammar RAP Protocol to this image. For each observation,
> state what you see before stating what it means. Identify which perceptual
> principles are active, which are in tension, and which appear absent. Do not
> assess whether these conditions succeed or fail. Do not infer intent. Report
> perceptual conditions only."

**Complete the routing step:**
Open the relevant displacement block. Check whether a category addendum exists
for this project's category (look in `displacement-library/[domain]-addenda/`).

If no addendum exists: fill in all routing fields manually — commercial
objective, brand stage, and category context.

If an addendum exists: fill in only the fields not pre-answered by the addendum
(typically commercial objective and brand stage). The addendum handles category
context.

If you don't know the context at all, use the "infer from visual evidence"
approach: ask Claude to complete the routing step based on what it can observe
in the image, then proceed on that basis.

**Pass 2:**
Submit the Pass 1 output plus the completed displacement block, and the category
addendum if one exists. Order matters:

```
[Pass 1 output]

---

[Full base displacement block — with routing fields completed]

---
CATEGORY ADDENDUM: [CATEGORY NAME IN CAPS]
[Full addendum text]
```

The displacement block tells Claude:
1. What default patterns to suppress (displacement)
2. What the context and objective are (routing, completed)
3. What evaluative tradition to use (redirect)
4. What works to compare against (reference class, supplemented by addendum
   if present)

The Pass 2 output is the tradition-calibrated evaluation.

### What good Pass 2 output looks like

- Uses the vocabulary of the domain, not fine art vocabulary
- References the canonical works in the reference class, not fine art or
  design community examples
- Applies criteria weighted to the stated objective
- Identifies specific conditions in the work — not abstract judgments

### What to do if Pass 2 output still drifts

If the output contains fine art vocabulary, wrong reference class examples, or
misapplied criteria after running the block:

1. Note exactly what drifted and quote the problematic output
2. Add a targeted suppression to the displacement block
3. Version up
4. Retest

This is how the block gets better. Every drift you catch and document makes
the block more precise.

---

## Part 8 — Maintaining the system

### When to update corpus files

Add to the corpus when:
- You find a primary source that adds vocabulary or criteria not already captured
- You discover a canonical work that better demonstrates a key criterion
- A test run reveals a gap — the redirect couldn't guide the model because the
  relevant vocabulary wasn't in the corpus

Do not add to the corpus casually. Each addition should be traceable to a real
source. Note the source in `source-extracts.md` before adding derived content
to `evaluative-criteria.md`.

### When to version up the displacement block

- Any time a new suppression is added
- Any time the routing step changes
- Any time redirect language is significantly updated
- Any time the reference class changes

### What NOT to do

- Don't update corpus files without checking whether the displacement block
  needs updating too.
- Don't change the block without retesting.
- Don't let the refinement log fall behind. Write entries at the time of the
  change, not later from memory.
- Don't use the block on a new domain without testing it first. A block built
  for CPG packaging will not work correctly for decorative arts.
- Don't treat a v1 block as production-ready. It is a first draft until tested.

### When a domain needs a sub-domain block

Sometimes a domain's evaluative criteria vary enough across sub-domains that
a single block can't handle them correctly. CPG packaging evaluated for premium
spirits requires different emphasis than CPG packaging evaluated for grocery
staples. Studio ceramics evaluated in the Mingei tradition requires different
weighting than studio ceramics in the contemporary Western fine craft tradition.

If you find that a single block produces meaningfully different quality outputs
across cases that should be comparable, consider whether a sub-domain block
is needed. The corpus files may already support it — you may only need to build
a new displacement block with tighter routing, not rebuild the entire corpus.

---

## Part 9 — Quick reference

### Starting a new domain (abbreviated checklist)

- [ ] Confirm real use case exists
- [ ] Run 5 mapping prompts on 2+ LLMs
- [ ] Identify 3+ primary sources from mapping output
- [ ] Source the texts (Gutenberg, Archive, JSTOR, museum scholarship)
- [ ] Extract from each source; write to source-extracts.md
- [ ] Build critics-and-frameworks.md
- [ ] Build canonical-works.md
- [ ] Build evaluative-criteria.md
- [ ] Run corpus completeness check
- [ ] Draft displacement block
- [ ] Review block for specificity
- [ ] Save as v1, mark as untested
- [ ] Gather 3–5 test images
- [ ] Run baseline (no block)
- [ ] Run with block; compare
- [ ] Document drift in refinement log
- [ ] Add targeted suppressions; version up
- [ ] Retest

### Adding a category addendum (abbreviated checklist)

Use when a category recurs frequently enough to justify pre-built context.

- [ ] Confirm category recurs across multiple projects or clients
- [ ] Run category convention prompt on 2 LLMs; compare
- [ ] Build category reference class (market performers, not award winners)
- [ ] Note which routing fields are effectively pre-answered for this category
- [ ] Write addendum (one page maximum)
- [ ] File in `displacement-library/[domain]-addenda/[category].md`
- [ ] Test with one real project using base block + addendum together
- [ ] Confirm addendum doesn't override or conflict with base block
- [ ] Note creation date at bottom of addendum file

### Existing domains

| Domain | Corpus status | Block version | Tested | Addenda |
|--------|--------------|---------------|--------|---------|
| CPG / Consumer Packaged Goods | Complete (first pass) | v1 | No | spirits-premium, beverage-functional, grocery-staples |
| Decorative Arts | Not started | — | — | — |
| Craft / Studio Craft | Not started | — | — | — |
| Archaeological / Anthropological | Complete (first pass) — v3 corpus files; Mimbres primary-source-supported; Hohokam/Puebloan/Casas Grandes paraphrase-supported | v3 | No | — |
| Pattern / Surface Design | Not started | — | — | — |

Update this table as domains are built and blocks are tested.

---

*This document should be updated whenever the system changes significantly.
If you've added a new step that isn't here, add it. If a step described here
turned out not to work the way described, correct it. The process manual is
as much a living document as the corpus files.*

*Last updated: May 2026*
