# Next Session Briefing
<!-- Updated end of Mar 21 session. Read before touching anything. -->

---

## Current State — What's Live

### Art Lab Landing Page (`hidden-grammar.astro`) — COMPLETE
Fully rebuilt. Current structure (top to bottom):
1. **Try Me button** — full-width green CTA → `/hidden-grammar/ai-analyze?mode=first-look&prompt=first-look-read`
2. **Persona cards** — three-column grid (Working artist / Educator / Just curious), routing: Working artist → `/hidden-grammar/for/artist`, Educator → `/hidden-grammar/for/educator`, Just curious → `/hidden-grammar/for/curious`
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
New `analysis-tools` and `presentation-tools` domain cards added to `analysisModes.js`.
- `analysis-tools`: Attention Engineering, Attention Engineering (IR), Physics Mode
- `presentation-tools`: Studio Foundations, Tour Guide Mode, Docent Script (Anchor V1)
MODES_REGISTRY updated: all 6 flipped to LIVE. Count: 5 domain cards, 25 prompts total.
toolkit-modes.js updated: all 6 modes flipped to live with direct-to-analyzer links. AE-IR entry added to Analyzing bucket.

---

### Item 2: Bug 2 (WIP CTA Loops) — COMPLETE
WIP `link` in `toolkit-modes.js` changed from `/hidden-grammar/toolkit#analyzing` (backward) to `/hidden-grammar/modes/fine-art` (forward to domain picker). The `constraints` field already explains why domain selection is required first.

---

### Item 3: Persona Entry Pages — COMPLETE
Three persona entry pages built at:
- `/hidden-grammar/for/artist` — Making + Analyzing live tools only, purple accent, "See all tools →" footer
- `/hidden-grammar/for/educator` — Talking bucket full (live + coming-soon), green accent, coming-soon cards dimmed
- `/hidden-grammar/for/curious` — Four-card prompt selector for `just-curious` mode (no toolkit link above fold), amber accent, "Browse all the tools →" footer
Persona card CTAs in `hidden-grammar.astro` updated to `/hidden-grammar/for/*` routes.
`just-curious` mode added to `analysisModes.js` with four prompts:
- `just-curious-surprise`, `just-curious-body-first`, `just-curious-accidental-mastery`, `just-curious-do-more`

---

### Item 4: Toolkit → Analyzer Flow Continuity — NOT DONE
**What works:** Toolkit live mode detail pages route to `/hidden-grammar/modes/[mode]` (the prompt picker). This is architecturally correct — domain modes (Fine Art, CPG, etc.) have multiple prompts and the picker is the right step.

**What's missing:** When a user arrives at `modes/[mode]` from the Toolkit, it feels like a detour — there's no visual continuity showing they're mid-flow.

**Suggested fix:** Add `?from=toolkit` param to Toolkit CTAs. On `modes/[mode].astro`, detect this param and show a breadcrumb or context line like "← Back to Toolkit" so the user knows where they are in the flow.

**Files to touch:**
- `src/data/toolkit-modes.js` — append `?from=toolkit` to CTA links for live modes
- `src/pages/hidden-grammar/modes/[mode].astro` — read `from` param, conditionally render back link

---

## Architecture Reference

### Zone Map — Do Not Mix
| Zone | Layout | Pages |
|------|--------|-------|
| A — AI tools | `HiddenGrammarLayout` | `hidden-grammar.astro`, `hidden-grammar/for/*`, `hidden-grammar/toolkit*`, `hidden-grammar/modes/*`, `hidden-grammar/ai-analyze.astro` |
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

---

## Account System — Phase 1 (Closed Beta)

**Source document:** `Art Lab — Account System Implementation Brief` (Obsidian vault, 2026-04-01)
**Read before touching anything in this section:** The implementation brief in full, then ROADMAP.md Theme 5.
**Scope:** Art Lab routes only. Middleware never touches homepage, Art Wheel, or any open content routes.
**Note on ROADMAP.md:** The brief supersedes Theme 5 where they conflict. Cloudflare KV is not needed—Clerk handles sessions natively. Do not add KV.

---

### Task 1: D1 Database Setup — NOT STARTED

**What:** Create the Cloudflare D1 database, bind it to the Pages project, run the schema migration.

**Why first:** Everything else attaches to user records. No database, no tasks 2–7.

**Steps:**
1. Cloudflare dashboard → Workers & Pages → your Pages project → D1 → create database named `artlab`
2. Add binding in Pages settings: variable name `DB`, database `artlab`
3. Create `schema.sql` at project root with four tables: `users`, `analyses`, `invite_codes`, `leads`
4. Run migration: `npx wrangler d1 execute artlab --file=./schema.sql`

**Files to create/touch:**
- `schema.sql` — root level, source of truth for all table definitions
- `wrangler.toml` — add D1 binding if not already present

**Done looks like:** `npx wrangler d1 execute artlab --command="SELECT name FROM sqlite_master WHERE type='table'"` returns all four table names. Stop here and report back.

---

### Task 2: Save/List API Endpoints — NOT STARTED

**What:** Two Cloudflare Pages Functions — POST to save an analysis, GET to list saved analyses. No auth yet. Use hardcoded `user_id = 'test-user'` to verify D1 wiring before Clerk is introduced.

**Why now:** Validates the D1 binding is live. Easier to debug data problems without auth in the way.

**Files to create:**
- `src/pages/api/analyses/save.ts` — POST: accepts `{ title, analysisText, modeUsed, principlesCited }`, inserts row into `analyses` with hardcoded user ID, returns `{ id, created_at }`
- `src/pages/api/analyses/list.ts` — GET: returns all rows for hardcoded user ID, ordered by `created_at DESC`

**Done looks like:** POST to `/api/analyses/save` returns a row ID. GET to `/api/analyses/list` returns that row. Hardcoded user ID visible in D1 via Wrangler. Stop here and report back.

---

### Task 3: Clerk Setup — NOT STARTED

**What:** Install `@clerk/astro`, configure middleware to protect Art Lab routes, test login/logout. Nothing outside Art Lab routes gets touched.

**Steps:**
1. `npm install @clerk/astro`
2. Create Clerk app at clerk.com — copy publishable key and secret key
3. Add to `.env`: `PUBLIC_CLERK_PUBLISHABLE_KEY=` and `CLERK_SECRET_KEY=`
4. Add Clerk integration to `astro.config.mjs`
5. Create or update `src/middleware.ts` — protect `/hidden-grammar/ai-analyze` and `/api/analyses/*` only. All other routes untouched.
6. Replace hardcoded `user_id = 'test-user'` in both API endpoints with `auth().userId` from Clerk

**Files to create/touch:**
- `src/middleware.ts` — Clerk auth, Art Lab routes only
- `astro.config.mjs` — Clerk integration
- `.env` — Clerk keys (never commit)
- `src/pages/api/analyses/save.ts` — swap hardcoded ID for real Clerk user ID
- `src/pages/api/analyses/list.ts` — same

**Done looks like:** Unauthenticated visitor hitting `/hidden-grammar/ai-analyze` is redirected to Clerk sign-in. After sign-in, analysis runs and save endpoint receives real user ID. List endpoint returns rows scoped to that user only. Homepage loads with zero auth friction. Stop here and report back.

---

### Task 4: Invite Code System — NOT STARTED

**What:** Admin endpoint to generate invite codes, Clerk webhook to validate them on registration, auto-tag new users as `beta` or `waitlist` tier.

**Why now:** Clerk is wired. The beta gate goes in before any external invites go out.

**Files to create:**
- `src/pages/api/admin/generate-invite.ts` — POST, localhost-only or password-protected for now; generates N unique codes, inserts into `invite_codes` table, returns code list
- `src/pages/api/webhooks/clerk.ts` — handles `user.created` event; validates invite code from user metadata or URL param; writes to `users` table with `tier = 'beta'` if valid, `tier = 'waitlist'` if not

**Environment variable to add:**
- `CLERK_WEBHOOK_SECRET=` (from Clerk dashboard, never commit)

**Done looks like:** Generate a code via admin endpoint. Register a new Clerk account using that code. Query `users` table—new row present with `tier = 'beta'`. Register without a code—row present with `tier = 'waitlist'`. Stop here and report back.

---

### Task 5: Waitlist Page — NOT STARTED

**What:** A page for visitors who arrive without an invite. Email capture only. No account created.

**Why now:** Before any external links go out, unauthenticated visitors need somewhere to land other than a Clerk error screen.

**Files to create:**
- `src/pages/hidden-grammar/waitlist.astro` — email field, submit button, success state. Uses `HiddenGrammarLayout`. Ira Glass voice. Semantic HTML only—no styling investment until Art Lab style guide is final.
- `src/pages/api/waitlist/join.ts` — POST: inserts email into `leads` table with `source = 'waitlist'`

**Routing change:** Unauthenticated visitors hitting `/hidden-grammar/ai-analyze` redirect to `/hidden-grammar/waitlist`, not to Clerk sign-in directly.

**Done looks like:** Submit an email via the form. Query `leads` table—row present with correct source tag. Unauthenticated visitor trying to reach the analyzer lands on the waitlist page, not a Clerk error. Stop here and report back.

---

### Task 6: Front-End — Login State, Save Button, History Panel — NOT STARTED

**What:** Three UI additions wired into the existing analysis flow:
1. Auth state indicator in the Art Lab header (logged in / sign in link)
2. Save button appearing after analysis completes—authenticated users only
3. History panel listing previous saved analyses—authenticated users only

**Files to touch:**
- `src/pages/hidden-grammar/ai-analyze.astro` — conditional rendering based on auth state: save button + history toggle when logged in; "sign in to save" note when not
- `src/scripts/ai-analyze/analysis.ts` — wire save button to `POST /api/analyses/save` after analysis renders; wire history panel to `GET /api/analyses/list` on open

**Styling note:** Semantic HTML only. No styling investment. This is scaffolding until the Art Lab style guide is finalized.

**Done looks like:** Logged in, run analysis, click Save—row appears in history panel. Logged out, run analysis—save button absent. History panel shows only analyses belonging to the logged-in user. Stop here and report back.

---

### Task 7: Post-Analysis Reflection Prompt — NOT STARTED

**What:** After a saved analysis, surface one optional question: "What are you noticing that you didn't notice before?" One text field. Saves alongside the analysis. Builds the OODA loop habit immediately.

**Files to touch:**
- `schema.sql` — add `reflection_note TEXT` to `analyses` table if not already present; run migration
- `src/pages/api/analyses/save.ts` — accept optional `reflectionNote` field, write to `reflection_note` column
- `src/scripts/ai-analyze/analysis.ts` — inject reflection prompt UI after save confirmation; submit on blur or explicit save button

**Done looks like:** Save an analysis, type a reflection note, submit. Query `analyses` table—`reflection_note` populated. Saving without a note still works cleanly. Stop here and report back.

---

## Phase 1 Architecture Reference

**New files:**
```
schema.sql
src/middleware.ts
src/pages/hidden-grammar/waitlist.astro
src/pages/api/analyses/save.ts
src/pages/api/analyses/list.ts
src/pages/api/admin/generate-invite.ts
src/pages/api/webhooks/clerk.ts
src/pages/api/waitlist/join.ts
```

**Environment variables (never commit):**
```
PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
```

**Hard constraint:** Middleware protects `/hidden-grammar/ai-analyze` and `/api/analyses/*` only. Every other route in the site is untouched. Try Me button stays fully public.

**Phase 1 is done when:** Alan can send one invite, that person creates an account, accesses the full Toolkit, runs and saves an analysis, and Alan can query D1 and see their user row and analysis count—without affecting any other user or any part of the site outside Art Lab.