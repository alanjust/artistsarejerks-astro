# Hidden Grammar AI Analysis — Architecture Reference

**Updated:** 2026-02-20
**Status:** Three-level navigation, dynamic fields, interrogation window

---

## Navigation Architecture (Three Levels)

```
Level 1: /hidden-grammar
  → 4 mode category cards (Fine Art, CPG, Comic Book, Commercial Illustration)
  → Driven entirely by analysisModes.js

Level 2: /hidden-grammar/modes/[mode-id]
  → SubMode selector (optional — adds specificity)
  → Prompt cards for the selected mode
  → Clicking a prompt navigates to Level 3 with URL parameters

Level 3: /hidden-grammar/ai-analyze?mode=[id]&prompt=[id]&submode=[id]
  → Upload window (permanent fixture)
  → Dynamic fields (from mode.fields[], rendered client-side from URL params)
  → Analyze button
  → Analysis output + Copy button
  → Interrogation window (follow-up questions)
```

---

## Data File: `src/data/analysisModes.js`

**Single source of truth** for all mode, prompt, field, and submode data.

**Exports:**
- `analysisModes` — array of 4 mode objects
- `basePrompt` — prepended to every initial analysis (server-side only)
- `interrogationBase` — prepended to every follow-up call (server-side only)
- `uiConfig` — controls showCopyButton, interrogationPlaceholder, etc.

**Mode object structure:**
```js
{
  id: 'fine-art',
  label: 'Fine Art',
  description: '...',
  subModes: [{ id, label, description? }],
  fields: [{ id, label }],
  prompts: [{ id, label, description, prompt }]
}
```

**To add a new mode:** Add an entry to the `analysisModes` array.
**To add a new prompt:** Add to `mode.prompts`.
**To change what fields appear:** Edit `mode.fields`.

---

## API Endpoint: `POST /api/analyze-artwork`

### Initial Analysis Request
```json
{
  "image": "data:image/jpeg;base64,...",
  "fields": {
    "artist": "Van Gogh",
    "title": "Starry Night",
    "medium": "Oil on canvas"
  },
  "promptText": "Conduct a full Hidden Grammar analysis...",
  "interrogationMode": false
}
```

### Interrogation Request (Follow-up)
```json
{
  "interrogationMode": true,
  "priorAnalysis": "...full prior analysis text...",
  "userQuestion": "How does the color temperature affect the mood reading?"
}
```

### Response (both modes)
```json
{
  "success": true,
  "analysis": "<h2>Analysis...</h2>",
  "raw": "## Analysis..."
}
```

---

## Prompt Construction

### Initial Analysis
- **System:** `basePrompt` (from analysisModes.js) + framework context (11 Roots, 54 Principles)
- **User:** Field context (labeled plain text) + `promptText` (mode-specific prompt from frontend)

`basePrompt` is read server-side and cannot be overridden by the frontend. `promptText` is sent from the frontend (sourced from analysisModes.js prompt.prompt) and appended after the non-negotiable base.

Field context format: `Artist: Van Gogh / Title: Starry Night / Medium: Oil on canvas`

### Interrogation
- **System:** `interrogationBase` (from analysisModes.js — non-negotiable)
- **User:** `PRIOR ANALYSIS:\n[full text]\n\nFOLLOW-UP QUESTION:\n[question]`

---

## Dynamic Field System

Fields are defined per mode in `analysisModes.js`. On page load, `initPage()` in `analysis.ts`:

1. Reads URL params (`mode`, `prompt`, `submode`)
2. Finds the matching mode in the serialized JSON embedded in the page
3. Renders `mode.fields[]` as form inputs (textarea for `notes`/`context`, input for everything else)
4. Populates the context header with mode label + prompt label

Fields with `id: 'notes'` or `id: 'context'` render as textarea. All others render as single-line input.

---

## Interrogation Window

- Appears below analysis output after analysis completes
- Text input + "Ask" button (or Shift+Enter)
- Each follow-up sends `interrogationMode: true` with `priorAnalysis` (always the main analysis output)
- Responses are appended as conversation turns below the main output
- Each turn has its own Copy button
- Conversation history persists on the page until "New Analysis" is clicked

---

## Client Script Architecture

```
src/scripts/ai-analyze/
├── index.ts          — Entry point, calls init functions
├── state.ts          — Shared state (image data, outputs, URL param values)
├── image-upload.ts   — Handles drag/drop, file selection, auto-compression
├── analysis.ts       — initPage() + initAnalysis() + wireCopyButton()
├── interrogation.ts  — initInterrogation(), appends conversation turns
├── exports.ts        — No-op (copy handled inline)
└── form-interactions.ts — No-op (selection moved to modes page)
```

---

## Layout Architecture

**HiddenGrammarLayout** (`src/layouts/HiddenGrammarLayout.astro`)
- Completely standalone — no dependency on BaseLayout
- Own header/footer/navigation
- Does not import AAJ fonts, color tokens, or site components
- Used by: `hidden-grammar.astro`, `modes/[mode].astro`, `ai-analyze.astro`

**BaseLayout** (unchanged)
- Still used by: `framework.astro`, `roots.astro`, `principles.astro`
- Artists Are Jerks main site unaffected

---

## Files Modified / Created

| File | Status |
|------|--------|
| `src/data/analysisModes.js` | Source of truth — no changes needed |
| `src/layouts/HiddenGrammarLayout.astro` | **NEW** — standalone mini-site layout |
| `src/pages/hidden-grammar.astro` | **REBUILT** — 4 mode cards |
| `src/pages/hidden-grammar/modes/[mode].astro` | **NEW** — dynamic prompt selection |
| `src/pages/hidden-grammar/ai-analyze.astro` | **UPDATED** — new layout, dynamic fields, interrogation |
| `src/pages/api/analyze-artwork.ts` | **UPDATED** — new request shape |
| `src/scripts/ai-analyze/analysis.ts` | **REWRITTEN** — initPage + new API shape |
| `src/scripts/ai-analyze/interrogation.ts` | **NEW** — follow-up question handling |
| `src/scripts/ai-analyze/state.ts` | **UPDATED** — new fields |
| `src/scripts/ai-analyze/exports.ts` | **EMPTIED** — copy handled inline |
| `src/scripts/ai-analyze/form-interactions.ts` | **EMPTIED** — selection moved upstream |
| `src/scripts/ai-analyze/index.ts` | **UPDATED** — new module loading |
| `astro.config.mjs` | Added webcoreui integration |

---

## Unchanged Pages (still on BaseLayout)

- `/hidden-grammar/framework` — framework overview
- `/hidden-grammar/roots` — 11 Roots browser
- `/hidden-grammar/principles` — 54 Principles catalog
