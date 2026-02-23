# Toolkit Section — CLAUDE.md

## What This Section Is

The Toolkit is the primary navigation layer for Art Lab (the public-facing name for Hidden Grammar). It organizes all analysis modes by what a visitor is trying to **do**, not by the system's internal phase logic.

It lives entirely in **Zone A** (HiddenGrammarLayout) alongside the existing AI analyzer.

---

## Files

```
src/data/toolkit-modes.js                        — Single source of truth for all toolkit modes
src/pages/hidden-grammar/toolkit.astro           — Toolkit list page (four use-case buckets)
src/pages/hidden-grammar/toolkit/[mode].astro    — Dynamic detail page for every mode
```

---

## Data Contract — toolkit-modes.js

Every mode entry must follow this shape:

```js
{
  id: 'unique-kebab-id',          // Required. Used in URL: /hidden-grammar/toolkit/[id]
  label: 'Display Name',          // Required.
  tagline: 'One-line descriptor', // Required. Shown on card and detail page header.
  status: 'live' | 'coming-soon', // Required. Controls badge color and CTA behavior.
  phase: 'Phase Name',            // Required. Shown as small label on card footer.
  link: '/override-url',          // Optional. Overrides default routing for live modes (see Link Logic below).
  note: 'Secondary note text',    // Optional. Shown as yellow callout on detail page.
  category: 'Category Name',      // Optional. Used only in stress-testing bucket to group lenses.
  detail: {                       // Optional. If absent, detail page shows placeholder text.
    what: 'What it does',
    when: ['Array', 'of', 'use cases'],
    output: 'What comes back',
    constraints: 'Framework rules, or null',
  }
}
```

**Status values:**
- `live` — Mode has a working prompt in `analysisModes.js`. Green badge. Routes to prompt picker.
- `coming-soon` — Planned or documented but not yet wired into AI tool. Gray badge. Detail page only.

**Never add a `documented` status to the site** — that's an internal MODES_REGISTRY.md category only.

---

## Link Logic — How Live Modes Route

The detail page (`[mode].astro`) builds the CTA link as follows:

```
if live AND mode.link exists  → use mode.link (override)
if live AND no mode.link      → /hidden-grammar/modes/${mode.id}
if coming-soon                → no CTA (holding message shown instead)
```

**When to use `link` override:**
WIP is an example. It's live but doesn't have its own mode page — it's a prompt inside each domain mode. Its `link` is set to `/hidden-grammar` (the domain picker). Any mode that's live but doesn't map 1:1 to an `analysisModes.js` mode ID needs a `link` override.

**Normal live modes** (Fine Art, CPG, Comic Book, Commercial Illustration) don't need `link` — they route automatically to `/hidden-grammar/modes/[id]` using their ID, which matches the ID in `analysisModes.js`.

---

## Bucket Structure

Four use-case buckets defined in `toolkitBuckets` array:

| id | Label |
|---|---|
| `making` | I'm making something |
| `analyzing` | I'm analyzing a work |
| `talking` | I'm talking about art to other people |
| `stress-testing` | I want to stress-test an idea |

The `stress-testing` bucket is handled differently in the template — modes are grouped by `category` field using `getLensCategories()`. All other buckets render a flat card grid.

---

## TypeScript Notes

`toolkit-modes.js` is a plain JS file with no type declarations. Astro's TypeScript checker infers a union type from the mode objects, which rejects optional fields (`note`, `link`, `category`) when they don't exist on every member of the union.

**Rules to avoid TS build failures:**
- All TypeScript and data processing must live in the **frontmatter** (between `---` fences), not inline in JSX templates
- TypeScript generics (`Record<K, V>`) cannot be written inside JSX — the `<>` is parsed as HTML
- Use `as any` casting in frontmatter for mode objects from this file
- Never write `const x: Record<string, any[]> = ...` inside JSX — move it to frontmatter

---

## Unfinished Item — Live Mode Param Passing

**This is a known gap that needs fixing in the next session.**

When a user clicks "Choose a prompt →" from a live mode detail page, they land on `/hidden-grammar/modes/[mode]`. From there, they choose a prompt, which routes to `/hidden-grammar/ai-analyze?mode=X&prompt=Y`. This works correctly.

However, the Toolkit detail page currently has no way to pass context (which mode, which prompt) through to the analyzer pre-selected. The existing `modes/[mode].astro` → `ai-analyze.astro` URL param system already handles this — the Toolkit just needs to route into that existing flow cleanly rather than bypassing it.

**What needs to happen:** Investigate whether the detail page CTA should deep-link to a specific prompt (pre-selecting mode + prompt in the URL) or always route to the domain's prompt picker first. This depends on whether toolkit modes map 1:1 to prompts or to domains.

---

## Pattern for Future Section Pages

The Toolkit established the pattern for all future card-based reference sections. Every new section (Roots, Principles, Lenses, Reference Materials) follows this same three-file structure:

1. **Data file** — `src/data/[section]-data.js` or `.json`
2. **List page** — `src/pages/hidden-grammar/[section].astro` — card grid
3. **Detail page** — `src/pages/hidden-grammar/[section]/[item].astro` — dynamic route

Planned sections using this pattern:
- 11 Hidden Grammar Roots (data exists: `hg-roots.json`)
- Hidden Grammar for Poles (data exists: `hg-poles.json`)
- 54 Art Principles (data exists: `hg-principles.json`)
- Interrogation Lenses (documented in `interrogation_lenses.md`)
- Reference Materials: Feldman Four-Step, Visual Arts Standards, Master Project Bible

---

## Status Sync Rule

`toolkit-modes.js` and `analysisModes.js` must stay in sync on live status.

If a prompt is added to `analysisModes.js`, the corresponding mode in `toolkit-modes.js` should be updated from `coming-soon` to `live`. Check `MODES_REGISTRY.md` for the full inventory and status tracking.
