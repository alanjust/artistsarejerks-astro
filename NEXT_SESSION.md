# Next Session Briefing
<!-- Written at end of Feb 23 session to orient the next chat. -->
<!-- Read this before touching anything. -->

---

## What Was Accomplished This Session

### 1. Toolkit — BUILT AND DEPLOYED

Three new files, all committed and live on hg-preview:

- `src/data/toolkit-modes.js` — All toolkit modes, four buckets, statuses, detail content
- `src/pages/hidden-grammar/toolkit.astro` — List page with card grid organized by use-case
- `src/pages/hidden-grammar/toolkit/[mode].astro` — Dynamic detail page for every mode
- `MODES_REGISTRY.md` — Full human-readable inventory of all modes across the system
- `src/pages/hidden-grammar/toolkit/CLAUDE.md` — Toolkit-specific documentation

Navigation: HiddenGrammarLayout nav now reads: Home | Toolkit | Analyze

### 2. MODES_REGISTRY.md — EXISTS AND IS COMPLETE

File is at `/Users/alanjust/artistsarejerks-astro/MODES_REGISTRY.md`. It catalogs 56+ modes with status (LIVE / DOCUMENTED / STUB / GAP) across all source files. It was committed. It exists.

---

## What Was NOT Done — Three Open Items

### Item 1: Hidden Grammar Section Landing Page — COPY DRAFTED, NOT BUILT

`src/pages/hidden-grammar.astro` still shows the OLD "Choose an Analysis Mode" screen with mode cards.

The plan is to replace it with a new Art Lab landing page. The copy was drafted in the previous session:

---

**Art Lab**

Most people look at art the way they look at a word in a foreign language — they know something's there, they just can't read it.

Art Lab gives you the tools to read it.

Not art history. Not critical theory. Not what you're *supposed* to feel. Just the mechanics of what's actually happening between the image and your eyes — and why it works the way it does.

---

**Who's it for**

If you're making something and feel like it's almost working but can't say why — it's for you.

If you've stood in front of a painting and knew something was going on but didn't have the words — it's for you.

If you teach art, lead tours, or talk about work to people who think they don't get it — it's for you.

If you've always suspected that "appreciating art" was a credential some people have and you don't — it's especially for you. There's no credential. There's just looking, and then looking more carefully.

---

**How it works**

You pick a tool based on what you're trying to figure out. You describe a work or upload an image. You get a structured analysis back — grounded in what's visually observable, not in what the art world has decided the work means.

No grades. No right answers. No judgment about what you felt.

The analysis tells you what your visual system is doing. You decide what to do with that.

---

**[Start with the Toolkit →]**

---

**Open question before building:** The opener "read it" uses a literacy metaphor — same territory as "Hidden Grammar" which Alan wanted to move away from because it can read as schoolmarmy. Alan hadn't confirmed whether this framing works or needs to change. Raise this before writing the page.

**What the old mode cards become:** The direct-to-mode cards (Fine Art, CPG, etc.) could move to the Toolkit page's Analyzing bucket — they're already there as live cards. The landing page's job is orientation and CTA to the Toolkit, not direct mode selection.

---

### Item 2: Live Mode Param Passing — NOT FIXED

**This is the most important unfixed bug.**

When a user clicks "Choose a prompt →" from a Toolkit live mode detail page, they land on `/hidden-grammar/modes/[mode]`. They pick a prompt there. That routes to `/hidden-grammar/ai-analyze?mode=X&prompt=Y`. This works correctly once they're in the modes flow.

**The miss:** The Toolkit detail page has no way to pre-select mode + prompt when sending users to the analyzer. The user has to re-select on the modes page.

**How the existing param system works:**
- `modes/[mode].astro` has a prompt card grid
- Clicking a prompt card fires JS that builds URL params: `?mode=[id]&prompt=[id]&submode=[id]`
- `ai-analyze.astro` reads those params on load and populates the interface

**What needs deciding:** Should Toolkit live mode detail pages link directly to a pre-selected prompt in the analyzer (bypassing the modes/[mode] picker), or should they always route through the prompt picker? This depends on whether each toolkit mode maps 1:1 to a specific prompt or to a domain.

Current situation:
- Fine Art, CPG, Comic Book, Commercial Illustration → map to entire domains (multiple prompts each) → should route to prompt picker
- WIP → maps to a prompt *within* each domain → can't pre-select without knowing which domain

The simplest fix for the domain modes: the Toolkit detail page CTA routes to `/hidden-grammar/modes/[mode.id]` (which is already what it does). That's actually correct — those modes have multiple prompts and the picker is the right next step.

The real fix needed: on the `modes/[mode].astro` page, add a visible indicator that the user arrived from the Toolkit (via referrer or a `?from=toolkit` param) so it feels like a continuous flow, not a detour.

---

### Item 3: WIP Mode — Partially Fixed

WIP is now marked `live` in `toolkit-modes.js` with a `link` override to `/hidden-grammar` (the domain picker). The detail page respects the `link` override. The constraints section of the detail page explains that WIP is available within each domain mode.

**What still needs attention:** WIP in `analysisModes.js` exists as a prompt inside Fine Art, CPG, Comic Book, and Commercial Illustration — not as its own mode. The Toolkit correctly routes WIP users to domain selection first. But there's no way for a user to get to WIP directly without going through domain selection. This is architecturally correct but may need better UX signposting on the WIP detail page.

---

## Architecture to Understand

### Naming Convention
- **Art Lab** = public-facing section name (use in UI, nav, copy)
- **Hidden Grammar** = framework name (use in docs, data files, technical references)
- These are not interchangeable.

### Two Zones — Do Not Mix
- **Zone A** (HiddenGrammarLayout): `hidden-grammar.astro`, `hidden-grammar/modes/`, `hidden-grammar/ai-analyze.astro`, `hidden-grammar/toolkit*`
- **Zone B** (BaseLayout): `hidden-grammar/framework.astro`, `hidden-grammar/roots.astro`, `hidden-grammar/principles.astro`

### The Correct User Flow (Zone A)
```
hidden-grammar.astro (Art Lab landing)
  ↓
hidden-grammar/toolkit.astro (pick a tool by use-case)
  ↓
hidden-grammar/toolkit/[mode].astro (what the tool does)
  ↓
hidden-grammar/modes/[mode].astro (pick a prompt)
  ↓
hidden-grammar/ai-analyze.astro?mode=X&prompt=Y (analyze)
```

### Three-Level Navigation (existing, do not change)
`/hidden-grammar` → `/hidden-grammar/modes/[mode]` → `/hidden-grammar/ai-analyze?params`

The Toolkit inserts itself between level 1 and the existing flow. It does not replace the existing flow.

---

## Files to Read Before Touching Anything

1. `CLAUDE.md` — site-wide rules, zone architecture, naming conventions
2. `src/pages/hidden-grammar/toolkit/CLAUDE.md` — Toolkit data contract, link logic, TS rules
3. `MODES_REGISTRY.md` — full mode inventory and status
4. `src/data/analysisModes.js` — source of truth for live AI tool modes/prompts
5. `src/data/toolkit-modes.js` — source of truth for Toolkit card content

---

## Suggested Order of Work

1. **Confirm or revise landing page copy** (the "read it" opener question)
2. **Build the new `hidden-grammar.astro` landing page** using the drafted copy
3. **Fix the Toolkit→Analyzer flow** (Item 2 above — param passing / flow continuity)
4. **Write `src/pages/hidden-grammar/toolkit/CLAUDE.md`** if any changes to data contract
