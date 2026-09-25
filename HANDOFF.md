# Handoff: start here in a new chat

Written September 25, 2026; updated later that day after a design session on the home page and the Artist Tools pages. The site is ready for Alan's artist friends to test. The next chat most likely begins with their feedback.

## Read first

1. **`CURRENT_STATUS.md`**: the full picture. It covers what's live, every decision Alan has made, configuration outside Git, test data, tests, and the open list. It's kept current after every change.
2. **This file**: how to pick up the work and how Alan likes to work.
3. The files the project `CLAUDE.md` lists, before touching the areas they cover.

## Where things stand

- **Everything is deployed to the private test site**, `https://aaj-dev.alanjust.com`. `main` matches `origin/main`, and all 11 test suites pass.
- **Built this session:**
  - Gatekeeping and terms: sample photos at application, Made with AI, Report this, New work with Hide, and five policy pages with agreement tracking.
  - Visitor and venue paths: navigation fixes, Write to us, the For Venues page and venue paths, and "Still up?" reminder emails.
  - Studios by appointment, and the account pages.
  - Fonts served from the site, and the Figma script removed.
- **Later on September 25:** a design-critique session. The header band is thinner, the home footer is just the copyright line and clears Safari's toolbar, and all five Artist Tools pages were rebuilt in one look (cream cards, pills and black panels, Ira Glass copy). The Benjamin Wheel became **Who Is Walter Benjamin?** at `/walter-benjamin/`. Gatekeepers now footnotes every number. Then: **What's a Jerk?** rebuilt around the Good/Bad/Normie jerks and eight visitor moments; **About** rewritten as Alan's short story; the old About thinkers became a new page, **Eight Ways to Look** (Good and Bad jerk notes only; Alan removed the Normie lines). Details are in `CURRENT_STATUS.md` under "Artist Tools pages".
- **Alan's voice and story for About copy:** art school (not the right one), a turn to illustration, graphic design, and packaging design after hitting the art world's barriers; he's been a jerk and "that guy still shows up now and then." Galleries are still the goal worth reaching for; the site helps artists get seen meanwhile and keeps helping after, like musicians playing local bars. Don't list credentials (docent, teaching) on the site; link to alanjust.com/about instead. His elevator pitch is in `ELEVATOR_PITCH.md`.
- **Reader for What's a Jerk?:** someone who's met a difficult artist or believes the stereotype. Visitors usually blame themselves ("I'm dumb"), so cards start from what the visitor felt. Suggested replies must calm things down, never add fuel.
- **Loose ends from that session:**
  - More artwork images for the Benjamin page would even out its desktop columns.
  - The Gatekeepers five-tile row on desktop hasn't been checked on a real screen.
  - The Fear tool's new closing layer and lighter shading haven't been seen on Alan's phone.
  - The one-line examples under Good jerks, Bad jerks, and Normies on What's a Jerk? are Claude's placeholders; Alan may have real ones.
  - Eight Ways to Look hasn't been checked on screen since the Normie lines came off.
  - Nobody has looked at "Everyday art" (renamed from General Purpose Art) with Alan explicitly; he didn't object.
- **Open list:** three optional items, a "delete my account" button, region extras, and internal cleanup. None blocks testing.
- **Alan's own pending checks:**
  - The venue walkthrough as AJ Test Four: apply from **Introduce your place**, approve it as alan@alanjust.com, then confirm the venue workspace appears on AJ Test Four's account page.
  - Re-save his studio listing (Edit, then Publish) to clear the old private phone and email from the record.
- **The tester invitation** is ready to send: https://claude.ai/artifact/5NMqFvPvUn4DvWP7ik6RWJ

## When tester feedback arrives

1. **Sort it** into three groups: things that are broken, things that confused someone, and ideas. Fix broken things first. Confusion usually means navigation or wording, not code, so fix the page, not the person.
2. **Check each report** before agreeing:
   - Look at the actual screen: Alan's screenshots, or the live data.
   - Query the test database when the question is about records. See "Checking live data" below.
3. **Before any UI change,** say in one sentence what you think Alan wants, then wait for his yes. For bigger changes, lay out the options with a recommendation first.
4. **After each change:**
   - Deploy to the test site.
   - Commit and push.
   - Update `CURRENT_STATUS.md`. Alan asks "update the status file" often; do it without being asked when a change lands.
   - If the change affects anything a tester sees, check whether the tester guide still matches.

## How Alan works (from his instructions and this session)

- **Greeting and voice:**
  - Address him as "Mr. Fuzzface" at the start of every reply. On the first reply of a session, also list the loaded `CLAUDE.md` paths.
  - Plain, warm, Ira Glass voice for anything visitors read (`agent_docs/voice-ira-glass.md`).
  - Em dashes never have spaces around them.
- **His descriptions are design critiques.** "Confusing" or "feels off" usually means navigation, spacing, or hierarchy.
- **Judge layouts from his real-device screenshots, not the code or the automated preview.** Twice this session I claimed something was hidden on phones when his screenshots showed it plainly (the home page "Start Here" sign). The preview's scrolling and cropping mislead.
- **He trusts recommendations.** Offer two or three options with one marked as recommended, and keep questions answerable in a word.
- **He is not having a lawyer review the terms.** Don't suggest one. Do point out cheap, concrete protections.
- **Styling:** design tokens only, no raw values in component CSS, mobile-first, 44px touch targets.
- **Deployment:**
  - New work goes to the test site only.
  - Never re-enable the public Pages builds or deploy the public site without asking.
- **Commits:** end each commit message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Key links

- **Test site:** https://aaj-dev.alanjust.com (Cloudflare Access gate; any email gets a one-time code)
- **Administrator inbox:** `/prototype/admin/inbox/` (sign in as alan@alanjust.com)
- **Tester guide:** https://claude.ai/artifact/5NMqFvPvUn4DvWP7ik6RWJ (shared by link; source kept in a scratchpad, so edit it by reading the artifact first)
- **The Fine Print drafts:** https://claude.ai/artifact/SPTdrvFNQeW6vwjpyM2Veq (history only; the live text is in `src/pages/*terms*.astro`, `guidelines.astro`, `privacy.astro`, `copyright.astro`)
- **Showing Now mockups:** https://claude.ai/artifact/EGzZasV2ZZZTr18XD8uBnq

## Accounts

- **alan@alanjust.com:** administrator. Owns the Alan Just artist page and runs the Alan Just Studio venue.
- **alanjust@gmail.com:** Alan Russell Just.
- **Test artists:** alanjust+test1 through +test4 @gmail.com. All four deliver to alanjust@gmail.com. Use +test5 and up for fresh runs.
- **Public contact:** info@artistsarejerks.com, an alias of admin@. Show info@ publicly, never admin@.

## Commands

```bash
npm run test:community
```

```bash
npm run build:test && npx wrangler deploy --config wrangler.test.jsonc
```

```bash
npx wrangler deploy --config community-api/wrangler.test.jsonc
```

- Database migrations are applied through `0011`. For a new one, run `npx wrangler d1 migrations apply aaj-community-test --remote --config community-api/wrangler.test.jsonc`.
- **Local development:**
  - Run `npm run dev` (port 4326) and `npm run community:dev` (port 8787).
  - The local database is `aaj-community-local` (config `community-api/wrangler.jsonc`), not `aaj-community-test`.

## Checking live data

Read the test database directly when a report is about records: who owns what, whether something saved. Use `npx wrangler d1 execute aaj-community-test --remote --config community-api/wrangler.test.jsonc --json --command "SELECT …"`.
- Most records are in `community_records` (collection, id, JSON payload).
- Account links are in `community_memberships`.
- Messages, followers, reports, notes, and reminders each have their own table.

## Design pattern for lesson pages

When Alan asks for a critique or redesign of a content page, follow what worked on September 25: critique from his screenshots, mock up the phone first (a before/after widget), wait for "build it," then build, check in the preview, deploy, commit, and push. Reuse the Artist Tools look: cream cards, the pills-and-black-panel pattern from `walter-benjamin.astro`, tokens only. Source any statistic before it goes on a page.

## Gotchas

- **Safari's floating toolbar covers the bottom of a full-height page** even with `100dvh`. The home footer uses `--toolbar-clearance` padding on phones; tune that one number from Alan's screenshots.

- **The local dev server sometimes keeps serving old component CSS** after a style edit. Restart it, or check the built CSS in `dist-test/_assets/` after `npm run build:test`.
- **Signed-in pages** (workspaces, inbox, account) can't be opened in the automated browser.
  - To look at one, make a temporary page that renders the component with seeded `localStorage` data, then delete the page before committing.
  - Otherwise, ask Alan for a screenshot.
- **Safari:** pages must `await storageReady` before reading shared data.
- **One stylesheet for the whole site** (`cssCodeSplit: false`), so namespace any global CSS.
- **Browser autofill** has signed Alan in as the wrong account before. When a record belongs to an unexpected account, check `submittedBy` in the database.

## A good first message for the new chat

> Read HANDOFF.md and CURRENT_STATUS.md. Here's feedback from my testers: …
