# Next Session Briefing
<!-- Updated end of Mar 20 session. Read before touching anything. -->

---

## Current State — What's Live

### Art Lab Landing Page (`hidden-grammar.astro`) — COMPLETE
Fully rebuilt. Current structure (top to bottom):
1. **Try Me button** — full-width green CTA → `/hidden-grammar/ai-analyze?mode=first-look&prompt=first-look-read`
2. **Persona cards** — three-column grid (Working artist / Educator / Just curious), routing: Working artist → `toolkit#making`, Educator → `toolkit#talking`, Just curious → `toolkit`
3. **Origin story copy** — Ira Glass voice, four paragraphs + "Why I built this →"
4. **Section rule**
5. **Second copy block** — brain flags / real levers + "How the visual grammar works →"
6. **Caution block** — amber callout, "One thing before you pick a tool"
7. **Sidebar** — Reading list (right column, sticky)
8. **Section cards grid** — full-width below, all Art Lab sections

### Analysis Output — Principle Linking (NEW)
Principle names in analysis output are now interactive:
- **Pointer devices** (desktop/laptop): floating popover appears near clicked name — shows subtitle, Brain, Studio fields + "View full principle →" link
- **Haptic devices** (iPhone/iPad): bottom sheet slides up from bottom
- Detection via `(hover: none), (pointer: coarse)` media query — not pixel breakpoints
- Tier badges removed from popover (AI tier labels don't match database)
- Principle name triggers styled bold italic with dotted indigo underline
- `principles.astro` now has `id="principle-{id}"` on every card + `scroll-margin-top: 90px` for clean anchor landing

### Analysis Output — Tier Label Stripping
- `Tier A — ` / `Tier B — ` prefixes stripped from all analysis HTML before render
- `(Tier A)` / `(Tier B)` standalone parentheticals stripped from Image Properties and Viewer Effects
- Applied to all three HTML sections: `analysis`, `imageProperties`, `viewerEffects`

### Analysis Voice — Ira Glass Opening
- `basePrompt` now requires a 80–110 word Ira Glass-style opening paragraph before IMAGE PROPERTIES
- Specific mechanics: no "This painting" opener, honest turn signals, short landing sentence
- Followed by `---` divider and transition line before the structural read

### Exploration Panel ("What could this become?")
- Shows after analysis for WIP prompts and Constraints & Opportunities mode
- Button styled to match Analyze This (target icon, same scale)
- Spinner replaces button while processing (green, large)
- Each angle rendered as isolated card with green left border + per-card copy button
- Wired in `analysis.ts` → `injectExplorationPanel()`

### Naming Convention — ENFORCED
- **Art Lab** — all user-facing copy, nav, UI
- **Hidden Grammar** — framework name, data files, internal docs only
- All user-facing "Hidden Grammar" and "AI" references converted across the section

### Principles Page — Studio Use Field Removed
- `studioUse` field was nearly identical to `howToUse` — removed from all four tier sections
- Each card now shows: Brain → (Edge Types/Gestalt where present) → Studio Tool → How to Use It → Pairs with

---

## Open Items

### Item 1: Wire 6 Documented Modes — COMPLETE
New `analytical-lenses` domain card added to `analysisModes.js` with 6 prompt entries:
Studio Foundations, Attention Engineering, Attention Engineering (IR), Physics Mode, Tour Guide Mode, Docent Script (Anchor V1).
Fields: title, artist, year, medium, dimensions, notes.
MODES_REGISTRY updated: all 6 flipped to LIVE. Count: 5 domain cards, 25 prompts total.

---

### Item 2: Toolkit → Analyzer Flow Continuity — NOT DONE
**What works:** Toolkit live mode detail pages route to `/hidden-grammar/modes/[mode]` (the prompt picker). This is architecturally correct — domain modes (Fine Art, CPG, etc.) have multiple prompts and the picker is the right step.

**What's missing:** When a user arrives at `modes/[mode]` from the Toolkit, it feels like a detour — there's no visual continuity showing they're mid-flow.

**Suggested fix:** Add `?from=toolkit` param to Toolkit CTAs. On `modes/[mode].astro`, detect this param and show a breadcrumb or context line like "← Back to Toolkit" so the user knows where they are in the flow.

**Files to touch:**
- `src/data/toolkit-modes.js` — append `?from=toolkit` to CTA links for live modes
- `src/pages/hidden-grammar/modes/[mode].astro` — read `from` param, conditionally render back link

---

### Item 3: WIP Detail Page Signposting — NOT DONE
**Situation:** WIP is live in `toolkit-modes.js` and routes to `/hidden-grammar` (domain picker) via `link` override. This is correct — WIP is a prompt within each domain, not a standalone mode.

**What's missing:** The WIP detail page in `toolkit/[mode].astro` doesn't clearly explain *why* it routes to domain selection first, or what happens next. A user who clicks "WIP" from the Toolkit and lands on the WIP detail page may not understand that they need to pick a domain before they can get to WIP.

**Suggested fix:** Add a "How to get there" step-list to the WIP detail page constraints/notes section explaining: pick your domain → pick WIP prompt → analyze.

**File to touch:** `src/data/toolkit-modes.js` — add a `howToAccess` field to the WIP entry, rendered in `toolkit/[mode].astro`

---

## Architecture Reference

### Zone Map — Do Not Mix
| Zone | Layout | Pages |
|------|--------|-------|
| A — AI tools | `HiddenGrammarLayout` | `hidden-grammar.astro`, `hidden-grammar/toolkit*`, `hidden-grammar/modes/*`, `hidden-grammar/ai-analyze.astro` |
| B — Reference | `BaseLayout` | `hidden-grammar/framework.astro`, `hidden-grammar/roots.astro`, `hidden-grammar/principles.astro` |

### Correct User Flow (Zone A)
```
hidden-grammar.astro (Art Lab landing)
  ↓
hidden-grammar/toolkit.astro (pick a tool by use-case)
  ↓
hidden-grammar/toolkit/[mode].astro (what the tool does)
  ↓
hidden-grammar/modes/[mode].astro (pick a prompt)        ← continuity gap is here
  ↓
hidden-grammar/ai-analyze.astro?mode=X&prompt=Y (analyze)
```

### Key Data Files
- `src/data/analysisModes.js` — source of truth for AI modes, prompts, fields, basePrompt
- `src/data/toolkit-modes.js` — source of truth for Toolkit card content, statuses, routing
- `src/data/hg-principles.json` — 54 principles (id, name, tier, neuralFact, studioTool)
- `MODES_REGISTRY.md` — human-readable inventory of all modes with status

### Key Script Files
- `src/scripts/ai-analyze/analysis.ts` — analysis submission, sidebar, exploration panel, principle linking
- `src/scripts/ai-analyze/interrogation.ts` — studio chat
- `src/scripts/ai-analyze/index.ts` — entry point, wires all modules

### basePrompt / interrogationBase
Server-side only. Never expose in frontend files. Lives in `analysisModes.js`. Not editable from the UI.

---

## Files to Read Before Touching Anything

1. `CLAUDE.md` — site rules, zone architecture, naming conventions, voice guides
2. `src/pages/hidden-grammar/toolkit/CLAUDE.md` — Toolkit data contract, link logic
3. `MODES_REGISTRY.md` — full mode inventory and status
4. `src/data/analysisModes.js` — live AI mode/prompt config
5. `src/data/toolkit-modes.js` — Toolkit card config
