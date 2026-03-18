# Artists Are Jerks - Astro Site

## Critical: Always Review Documentation First

**Before implementing any code, review:**
- **STYLING_GUIDE.md** - Responsive design strategy, design tokens, CSS patterns
- **COLOR_REFERENCE.md** - 26-color palette reference

## Screenshot & Design Priority

1. **Uploaded screenshots** - Follow exactly as shown
2. **Direct instructions** - User's current request
3. **Documentation** - Default patterns in guides

**Color handling:**
- Map screenshot colors to closest existing token in `COLOR_REFERENCE.md`
- Never extract hex values from screenshots (compression artifacts)
- Ask if color match is uncertain

## Responsive Design Approach

**Desktop-first** (1440px baseline):
- Base styles for desktop, use `max-width` queries to adapt down
- Hybrid: Container queries for components, media queries for layouts
- Generic breakpoints: 1440px, 1024px, 768px, 640px, 375px, 320px

## Project Info

**Framework:** Astro
**Styling:** Custom CSS with design tokens (NO Tailwind)
**Fonts:** Spicy Rice (display), Averia Sans Libre (headings/body)
**Design System:** `src/styles/tokens.css`

**Key Files:**
- Design tokens: `src/styles/tokens.css`
- Base styles: `src/styles/base.css`
- Utilities: `src/styles/utilities.css`
- Layout: `src/layouts/BaseLayout.astro`

## Coding Standards

- Desktop-first responsive design
- Use design tokens (`var(--color-purple)`) never hardcode values
- Scoped component styles preferred over utilities
- All pages scroll by default (except homepage with `bodyClass="homepage"`)
- Touch targets: 44px minimum on tablets/phones (1023px and below)

## Build Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

---

## Public-Facing Voice — Ira Glass Style (Default)

Think about what it's like to read something online and actually stay. Most copy gives you the concept first—what the thing is, what problem it solves. And somewhere in the third sentence, you're gone. Not because you stopped caring. Because nothing happened yet.

That's the problem this voice is built to solve.

Ira Glass, over thirty years of _This American Life_, worked out a specific structure for this. He called it the building block of story: an anecdote that creates forward momentum, followed by a moment of reflection that tells you why any of it matters. The anecdote pulls. The reflection lands. Neither works without the other.

**How it works in practice:**

Open with a specific situation, not a claim. Not "this tool helps artists analyze their work"—but "think about the last time you stood in front of a painting and weren't sure what you were supposed to feel." Put the reader in a recognizable moment before you tell them anything about it.

Then move. Use "so," "here's," "and here's where it gets complicated." These aren't just transitions—they're the writer noticing something alongside the reader, in real time. The reader follows because the writer is genuinely working something out, not reciting a prepared position.

Name the complication honestly. If there's real tension in the idea, say it. "I want to be careful here, because..." isn't hedging. It's what trust sounds like.

Then land. The ending tells you what the thing actually does—not what it intends, not what it is. "That's a question institutions have been circling for a long time. They just haven't had a way to answer it."

**Rhythm:** Longer sentences build the thought. Short ones land it. Read the copy aloud. If it sounds like someone presenting at a conference, rewrite it. If it sounds like someone thinking out loud and arriving at real things, it's right.

**Specific moves:**

- The concrete before the abstract, always
- Proper nouns and specific examples over category names
- "And here's where it gets complicated" as an honest turn signal
- The point arrives—it isn't announced in advance

**What to avoid:**

- Opening with a claim before grounding it in a situation
- Explaining what a section will do instead of doing it
- Clipping too hard—this voice earns its length; don't compress it into Adam Moss fragments
- Institutional hedging ("we believe," "our mission is")
- Jargon without immediate plain-English follow-through
- Academic shorthand pretending to be an explanation.

**Reference:** The "A Challenge to Institutional Authority" essay (260313) is the canonical example of this voice. When in doubt, match that register.

---

### Public-Facing Voice — Adam Moss Style (Alternative — invoke explicitly)

All public-facing copy on this site — page intros, section descriptions, card text, CTAs, onboarding text, any prose a visitor reads — follows the voice and style of Adam Moss, particularly as demonstrated in *The Work of Art* (2024).

**Core characteristics:**
- Short declarative sentences that earn their length. No throat-clearing.
- Fragments are intentional and used for emphasis. "That's where the real levers are."
- Observations that do a lot of work without explaining themselves. Trust the reader.
- Precise but warm. Never decorative. Never gushing.
- Questions asked like the writer actually wants the answer.
- Active present tense. The reader is doing something right now.
- The writer is a co-conspirator — curious about the reader's specific situation, rooting for them.

**Structural patterns:**
- Lead with the thing that matters most. No wind-up.
- Short paragraph → shorter paragraph → single punchy line. Build toward compression.
- The bridge sentence does the work of a section break. No headers needed.
- Three-beat rhythm for audience address: making / looking / helping others look.

**What to avoid:**
- Defensive copy ("No grades. No judgment.") — just don't be those things.
- Explaining the tool before making the promise.
- Passive constructions and institutional hedging.
- Jargon without grounding ("neuroaesthetic mechanisms") unless immediately followed by plain-English translation.
- Complimenting the reader for being here.
- Anything that sounds like a product landing page or academic abstract.

**Tone test:** Read the copy aloud. If it sounds like someone presenting at a conference, rewrite it. If it sounds like someone leaning across a table, it's right.

**Reference:** The intro copy on `hidden-grammar.astro` (the Art Lab landing page) is the canonical example of this voice on this site. When in doubt, match that register.

---

## Hidden Grammar Mini-Site

Before touching anything in `hidden-grammar/`, read:
- **HIDDEN_GRAMMAR_AI_SETUP.md** — Architecture for the AI analysis section (layouts, data flow, API shape, script modules)
- **HIDDEN_GRAMMAR_COMPLETE.md** — Full framework reference (Roots, Principles, Poles, analysis modes)

### Two Architectures — Do Not Mix

Hidden Grammar has two distinct zones with different layouts and data sources:

**Zone A: AI Analysis** (`hidden-grammar.astro`, `hidden-grammar/modes/`, `hidden-grammar/ai-analyze.astro`)
- Uses **HiddenGrammarLayout** (`src/layouts/HiddenGrammarLayout.astro`) — completely standalone
- Data source: **`src/data/analysisModes.js`** — single source of truth for modes, prompts, fields, submodes
- Has its own API endpoint: `src/pages/api/analyze-artwork.ts`
- Do NOT import AAJ fonts, color tokens, or site components here
- Do NOT use BaseLayout in this zone

**Zone B: Reference Pages** (`hidden-grammar/framework.astro`, `hidden-grammar/roots.astro`, `hidden-grammar/principles.astro`)
- Uses **BaseLayout** — normal AAJ site layout
- Data sources: `src/data/hg-roots.json`, `hg-principles.json`, `hg-poles.json`, `hg-modes.json`
- Uses existing AAJ design tokens and fonts normally
- Do NOT use HiddenGrammarLayout here

### Critical Rules for Zone A

- `analysisModes.js` is the **only** place to add/edit modes, prompts, fields, and submodes — never hardcode these in page files
- `basePrompt` and `interrogationBase` are server-side only — never expose or reference in frontend files
- `promptText` travels from frontend (sourced from `analysisModes.js`) to the API endpoint — this is intentional
- Client scripts live in `src/scripts/ai-analyze/` — each module has a specific role (see HIDDEN_GRAMMAR_AI_SETUP.md)
- Three-level navigation is strict: `/hidden-grammar` → `/hidden-grammar/modes/[mode]` → `/hidden-grammar/ai-analyze?params`

### Hidden Grammar Data Files (Zone B)

```
src/data/
  hg-roots.json       — 11 Roots with full structure
  hg-principles.json  — 54 Principles with tiers (A/B/C/D)
  hg-poles.json       — 4 Poles with system rules
  hg-modes.json       — 13 analysis modes
  analysisModes.js    — Zone A AI modes, prompts, fields (source of truth)
```

Import Zone B data directly:
```typescript
import roots from '../data/hg-roots.json';
import principles from '../data/hg-principles.json';
```

### Art Lab / Hidden Grammar — Naming Convention

- **Art Lab** — Public-facing section name used in UI, nav, and visitor-facing copy
- **Hidden Grammar** — Framework name used in documentation, data files, and internal references
- Do not conflate these. The section is Art Lab. The analytical system it runs is Hidden Grammar.

### Toolkit — Zone A Addition

The Toolkit is a new navigation layer in Zone A. It organizes all modes by visitor use-case rather than domain. See `src/pages/hidden-grammar/toolkit/CLAUDE.md` for full documentation.

**New files this session:**
- `src/data/toolkit-modes.js` — All toolkit modes with status, detail, and routing data
- `src/pages/hidden-grammar/toolkit.astro` — Toolkit list page (four buckets)
- `src/pages/hidden-grammar/toolkit/[mode].astro` — Dynamic detail pages
- `src/pages/hidden-grammar/toolkit/CLAUDE.md` — Toolkit-specific documentation
- `MODES_REGISTRY.md` — Human-readable index of all modes with status tracking

**Toolkit CTA routing:** Live mode detail pages route to `/hidden-grammar/modes/[id]` (the prompt picker), where mode+prompt params are set before navigating to the analyzer. Resolved — `link` overrides removed from fine-art, cpg, comic-book, and commercial-illustration in `toolkit-modes.js`.

---

## Current Work Scope

Experimentation is currently scoped to the Hidden Grammar / Art Lab section only:

```
src/pages/hidden-grammar/
src/data/analysisModes.js
src/data/toolkit-modes.js
src/data/hg-*.json
src/scripts/ai-analyze/
src/layouts/HiddenGrammarLayout.astro
src/pages/api/analyze-artwork.ts
```

Do not modify anything outside these paths unless Alan explicitly says otherwise. The rest of the AAJ site is not in scope.
