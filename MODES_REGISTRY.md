# Hidden Grammar — Modes Registry
<!-- Last updated: 2026-02-23 -->
<!-- Source of truth for all analysis modes across the Hidden Grammar system. -->
<!-- STATUS KEY: LIVE | DOCUMENTED | STUB | GAP -->
<!--   LIVE       = In analysisModes.js, fully functional in the AI tool -->
<!--   DOCUMENTED = In hg-modes.json with full prompt, not yet in AI tool -->
<!--   STUB       = In hg-modes.json, prompt placeholder only -->
<!--   GAP        = In older source docs, not in site anywhere -->

---

## HOW TO USE THIS FILE

- To add a mode to the AI tool: write the prompt, set status to DOCUMENTED, then add to analysisModes.js and flip to LIVE.
- To retire a mode: change status to RETIRED and add a note. Don't delete the entry.
- Prompt console source: `000_prompt_console_v3_3.md`
- Lenses source: `interrogation_lenses.md`
- AI tool source of truth: `src/data/analysisModes.js`
- Full mode specs: `src/data/hg-modes.json`

---

## SECTION 1: DOMAIN MODES
*Organized by what you're analyzing. These are the Level 1 cards on the AI tool home page.*

| ID | Label | Status | Prompts (Level 2) | Notes |
|----|-------|--------|-------------------|-------|
| `fine-art` | Fine Art | **LIVE** | Comprehensive, WIP, Materiality & Surface, Spatial Structure, Historical Positioning | 5 prompts |
| `cpg` | Consumer Packaged Goods | **LIVE** | Shelf Performance, Brand Differentiation, Demographic Alignment, Design in Progress | 4 prompts |
| `comic-book` | Comic Book & Sequential Art | **LIVE** | Comprehensive, WIP, Audience Assessment, Style Classification, Market Context | 5 prompts |
| `commercial-illustration` | Commercial Illustration | **LIVE** | Comprehensive, WIP, Communication Clarity, Audience Signals, Character Design | 5 prompts |

---

## SECTION 2: ANALYTICAL LENS MODES
*Organized by how you're analyzing. These swap the analytical brain, not the subject.*

### Phase 0 — Discovery & Priming
*Use before analysis when the work is fragile or undefined.*

| ID | Label | Status | Prompt source | Notes |
|----|-------|--------|---------------|-------|
| `intuition` | Intuition Primer | **STUB** | hg-modes.json | Protects raw signal, avoids premature polish |
| `constraints` | Constraints Primer | **GAP** | prompt_console v3.3 | "Three words I'm chasing" — sets analysis boundaries |
| `pivot` | Pivot Primer | **GAP** | prompt_console v3.3 | Keep/Kill/Try — aggressive edit mode when stuck |

### Phase 1 — Core Analysis
*Primary tools for understanding finished work.*

| ID | Label | Status | Prompt source | Notes |
|----|-------|--------|---------------|-------|
| `strategic` | Strategic Mode | **STUB** | hg-modes.json | Standard critique, connects to Master Project Bible |
| `physics` | Physics Mode | **DOCUMENTED** | hg-modes.json | Gravity / Entropy / Material / Capacity checks |
| `historian` | Historian Mode | **STUB** | hg-modes.json, prompt_console v3.3 | Academic breakdown, canon positioning |
| `friction` | Friction Audit | **STUB** | hg-modes.json, prompt_console v3.3 | Twombly vs. Kinkade test, friction density 0–10 |

### Phase 2 — Studio Tools
*For fixing and making. Active studio use.*

| ID | Label | Status | Prompt source | Notes |
|----|-------|--------|---------------|-------|
| `studio-foundations` | Studio Foundations | **DOCUMENTED** | hg-modes.json | Beginner critique, Feldman 4-step, IR-aligned |
| `attention-engineering` | Attention Engineering | **DOCUMENTED** | hg-modes.json | Dwell time, snags/slides, friction engineering |
| `attention-engineering-ir` | Attention Engineering (IR) | **DOCUMENTED** | hg-modes.json | AE + split novelty score + Attention Pattern Profile |
| `wip` | WIP Mode | **STUB** | hg-modes.json, prompt_console v3.3 | Mid-stream check, alignment of intent vs. execution |
| `technician` | Technician Mode | **STUB** | hg-modes.json, prompt_console v3.3 | Root → Principle mapping, neural mechanism target |
| `novelty` | Novelty Check | **STUB** | hg-modes.json, prompt_console v3.3 | Cliché shield, common→unique spectrum, score 1–10 |
| `blueprint` | Blueprint Mode | **STUB** | hg-modes.json, prompt_console v3.3 | Aphantasia planning tool, Flight Path + Rules |
| `chaos` | Chaos Variable | **GAP** | prompt_console v3.3 | Suggests opposing principle to break predictability |
| `router` | Mixture of Experts Router | **GAP** | prompt_console v3.3 | Classifies work type, routes to specialist lens |
| `distill-composition` | Distill: Composition | **GAP** | prompt_console v3.3 | Single-root pass/fail — Tzimtzum / positive-negative space |
| `distill-color` | Distill: Color | **GAP** | prompt_console v3.3 | Single-root — Or/Chomer / temperature-saturation logic |
| `distill-narrative` | Distill: Narrative | **GAP** | prompt_console v3.3 | Single-root — S-P-R / eye vector trace |

### Phase 3 — Simulation & Context
*Testing how the work lives in the real world.*

| ID | Label | Status | Prompt source | Notes |
|----|-------|--------|---------------|-------|
| `tour-guide` | Tour Guide Mode | **DOCUMENTED** | hg-modes.json | Museum docent, Schneider-specific, IR-aligned |
| `docent-script` | Docent Script (Anchor V1) | **DOCUMENTED** | hg-modes.json | 4–6 min monologue, anchor artwork format |
| `global` | Global Mode | **STUB** | hg-modes.json, prompt_console v3.3 | Non-Western lenses, Global Echoes database |
| `curator` | Curator Mode | **GAP** | prompt_console v3.3 | 150-word wall text, Root logic in plain English |
| `gift-living` | Gift: Living With It | **GAP** | prompt_console v3.3 | Room physics stress test — value, peripheral, buzz |
| `gift-comfort` | Gift: Comfort Dial | **GAP** | prompt_console v3.3 | 0–5 ratings: Comfort, Edge, Mystery |
| `gift-relationship` | Gift: Relationship | **GAP** | prompt_console v3.3 | Personal vs. generic — intimacy test |

### Phase 4 — External Lenses
*Philosophical and critical frameworks applied as analytical overlays.*

> These lenses swap the critique criteria, not the image. Each one reframes the same visual evidence through a specific theoretical model. The prompts in `interrogation_lenses.md` are well-developed and ready for adaptation.

#### Category 1: Ontological & Philosophical (Deep Theory)

| ID | Label | Status | Source | Notes |
|----|-------|--------|--------|-------|
| `lens-ooo` | Object-Oriented Ontology | **GAP** | both sources | Graham Harman / Timothy Morton — object autonomy, flat ontology |
| `lens-phenomenology` | Phenomenological | **GAP** | both sources | Merleau-Ponty — embodied encounter before cognition |
| `lens-deconstruction` | Deconstructionist | **GAP** | both sources | Derrida — aporia, trace, internal contradiction |
| `lens-new-materialism` | New Materialist | **GAP** | both sources | Jane Bennett — agency of materials as co-authors |
| `lens-semiotics` | Semiotic | **GAP** | both sources | Barthes — signifier/signified, death of the author |

#### Category 2: Specific Critics (Voice Emulation)

| ID | Label | Status | Source | Notes |
|----|-------|--------|--------|-------|
| `lens-yau` | John Yau Lens | **GAP** | interrogation_lenses.md | Outsider/poetic — rejects canonical readings, hunts the glitch |
| `lens-saltz` | Jerry Saltz Lens | **GAP** | interrogation_lenses.md | Visceral/subjective — high-energy, "does this have heat?" |
| `lens-smith` | Roberta Smith Lens | **GAP** | interrogation_lenses.md | Historian/observer — long-view, precise surface description |
| `lens-hickey` | Dave Hickey Lens | **GAP** | interrogation_lenses.md | Beauty/market — democratic appeal, anti-academic |
| `lens-greenberg` | Clement Greenberg Lens | **GAP** | interrogation_lenses.md | High Modernist formalism — flatness, medium specificity |
| `lens-krauss` | Rosalind Krauss Lens | **GAP** | interrogation_lenses.md | Structuralist — Expanded Field, indexical vs. symbolic |

#### Category 3: Cultural & Social (Context)

| ID | Label | Status | Source | Notes |
|----|-------|--------|--------|-------|
| `lens-institutional` | Institutional Critique | **GAP** | both sources | White cube dependency, who is excluded |
| `lens-postmodern` | Postmodern | **GAP** | interrogation_lenses.md | Pastiche, high/low collapse, everything-already-painted |
| `lens-ngai` | Minor Emotions (Ngai) | **GAP** | interrogation_lenses.md | Cute / Zany / Interesting — attention economy categories |
| `lens-relational` | Relational Aesthetics | **GAP** | interrogation_lenses.md | Bourriaud — social interstice, micro-utopia or barrier |
| `lens-metamodern` | Metamodern | **GAP** | interrogation_lenses.md | Oscillation between irony and sincerity |

#### Category 4: Outliers & Stress Tests

| ID | Label | Status | Source | Notes |
|----|-------|--------|--------|-------|
| `lens-dark-ecology` | Dark Ecology | **GAP** | interrogation_lenses.md | Timothy Morton — nature as weird mesh, non-human time scales |
| `lens-glitch-feminism` | Glitch Feminism | **GAP** | interrogation_lenses.md | Legacy Russell — failure as refusal, error as weapon |
| `lens-uncanny` | Uncanny Valley | **GAP** | interrogation_lenses.md | Freud/Mori — Heimlich/Unheimlich, creep reflex |
| `lens-slow-art` | Slow Art | **GAP** | interrogation_lenses.md | Arden Reed — deceleration, what appears after 3 minutes |

#### Category 5: Hidden Grammar–Specific Expansions

| ID | Label | Status | Source | Notes |
|----|-------|--------|--------|-------|
| `lens-neuro-archaeology` | Neuro-Archaeology | **GAP** | both sources | Painting as fossil record of nervous system, motor trace |
| `lens-algorithmic` | Algorithmic Gaze | **GAP** | interrogation_lenses.md | Computer vision perspective — edge detection, statistical pattern |
| `lens-biophilic` | Biophilic | **GAP** | interrogation_lenses.md | Evolutionary aesthetics — savannah preference, fractal dimension |
| `lens-abject` | Abject (Kristeva) | **GAP** | interrogation_lenses.md | Subject/object border collapse, bodily threat |
| `lens-hauntology` | Hauntology | **GAP** | interrogation_lenses.md | Mark Fisher — lost futures, nostalgic for what never happened |
| `lens-gesamtkunstwerk` | Gesamtkunstwerk | **GAP** | interrogation_lenses.md | Total work of art — ecosystem vs. object, utopia vs. prison |

### Phase 5 & 6 — Philosophical Plug-ins & System Debug

> Plug-ins were designed to append to other prompts, not run standalone. Candidates for the interrogation window as optional modifiers rather than standalone modes.

| ID | Label | Status | Source | Notes |
|----|-------|--------|--------|-------|
| `plugin-kant` | Kant | **GAP** | prompt_console v3.3 | Noumenon/Phenomena — stripping to Thing-in-Itself |
| `plugin-wittgenstein` | Wittgenstein | **GAP** | prompt_console v3.3 | Logic check — image as proposition, silence as failure |
| `plugin-lewitt` | Sol LeWitt | **GAP** | prompt_console v3.3 | System check — is the idea the machine? |
| `plugin-deleuze` | Deleuze | **GAP** | prompt_console v3.3 | Force check — cliché destruction, map vs. tracing |
| `plugin-plato` | Plato | **GAP** | prompt_console v3.3 | Geometry check — Form vs. Shadow |
| `full-audit` | Full Hidden Grammar Audit | **STUB** | hg-modes.json, prompt_console v3.3 | tpl_hg_audit_packet_art_v1 — all 6 sections, strict gates |
| `chain-of-thought` | Chain of Thought | **STUB** | hg-modes.json, prompt_console v3.3 | Exposed reasoning trace before verdict |
| `radar` | Radar Score | **GAP** | prompt_console v3.3 | 0–5 quantified scores across all 11 Roots |
| `ds-max` | Full Stack (DS-MAX) | **GAP** | prompt_console v3.3 | Chain of Thought + Physics + Strategic in sequence |

---

## SECTION 3: STATUS SUMMARY

| Status | Count | Notes |
|--------|-------|-------|
| LIVE | 4 domain modes + 19 prompts | In the AI tool, functional |
| DOCUMENTED | 6 | Full prompts written, ready to add to analysisModes.js |
| STUB | 10 | In hg-modes.json, prompts need writing |
| GAP | 36 | In source docs only, nothing in the site |
| **Total** | **56+** | — |

---

## SECTION 4: RECOMMENDED NEXT ACTIONS

### Immediate (prompts already written)
Add these DOCUMENTED modes to `analysisModes.js` as a new `analytical-lenses` domain card:
- Studio Foundations
- Attention Engineering
- Attention Engineering (IR)
- Physics Mode
- Tour Guide Mode
- Docent Script (Anchor V1)

### High value (prompts need writing, clear source material)
- External Lenses block (26 lenses from `interrogation_lenses.md`) — most developed gap material
- Friction Audit — stub in hg-modes.json, full version in prompt_console
- Historian Mode — same
- Curator Mode — clear brief, short output, useful for museum context

### Architectural question (before building)
Philosophical Plug-ins (Kant, LeWitt, Deleuze, Plato, Wittgenstein) were designed as modifiers, not standalone modes. Decide before building: standalone cards, or interrogation window add-ons?

### Lower priority
GIFT modes, DISTILL modules, RADAR, DS-MAX — useful but specialized. Build after core analytical lens modes are live.

---

*This file is the human-readable index. The AI tool source of truth is `src/data/analysisModes.js`. When in doubt, the site wins.*
