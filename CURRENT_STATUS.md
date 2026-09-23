# Artists Are Jerks: current status

Updated September 22, 2026, after gatekeeping step 1. `main` matches `origin/main`. Start here; `TEST_SITE_SETUP.md` is the older chronological log.

## What the site is for

The community part of Artists Are Jerks exists to get people in front of real art in person. Think of a musician's tour calendar: the artist page is the music clip that helps a visitor decide to go, not the destination. Showing Now is the front door. The site has two parts, **See Art** (Showing Now, Places to See Art, Our Artists) and **Artist Tools** (the lessons). Design is mobile-first.

## Where things run

- **Private test site:** `https://aaj-dev.alanjust.com`, behind Cloudflare Access. New work is deployed here only.
  - Site: `npm run build:test` then `npx wrangler deploy --config wrangler.test.jsonc`
  - Storage service: `npx wrangler deploy --config community-api/wrangler.test.jsonc`
  - Database changes: `npx wrangler d1 migrations apply aaj-community-test --remote --config community-api/wrangler.test.jsonc` (applied through `0009`)
- **Public Pages site** (`artistsarejerks-astro.pages.dev`): automatic production and preview builds were turned **off** on September 21. Pushing to `main` changes nothing public.
- **Local:** `npm run dev` (port 4326) and `npm run community:dev` (port 8787), with separate local storage. `npm run community:migrate` applies local migrations.

## What's live on the test site

**Showing Now** (`/showing-now/`)
- A two-across grid of current showings, A–Z by artist last name. Tags come from the dates: "Ends Thursday", "Last day", "Just opened", "Ongoing · since June", "Opens Nov 5".
- City and Search sit below the grid. After them come Ongoing (rows) and Artists to come (rows).
- "Rogue Valley, Oregon (somewhere else?)" links to the region picker, `/showing-now/regions/`.
- FPO sample tiles (Mia Chen, Luis Moreno, Rae Adams, Kenji Sato, Sam Ortiz) show on the test site and are labeled.
- **Our Artists** (`/our-artists/`) holds the roster, with "Showing now" badges.

**Header and menu**
- Every size has one header and one black menu panel, grouped into See Art and Artist Tools.
- On a phone: title, a "Showing Now" shortcut, and ☰.
- On desktop: See Art links in the header, plus "Your account / Sign in" floating under it on the right. The old black strip of links is gone.
- The history section's "Artists" link is renamed "Artists in History".

**Joining and onboarding**
1. **Apply** (`/join/?kind=artist`). Signed-out visitors create an account first, then return. Four fields (name, city, what you make, where we can see your work) plus **two or three photos of their work**. The email comes from the account.
   - The form spells out the standard: art made to be looked at, not crafts, useful objects, or merchandise; ceramics and glass only when made for display; AI images welcome if labeled.
   - The photos become the first pieces on the artist's page. You're emailed about the request only once they arrive. A request saved without them asks for just the photos next time.
2. **Private page opens immediately.** Applying creates the artist record and workspace membership together. Nothing is public until approval.
3. **Approval** in `/prototype/admin/inbox/`. Each artist request shows its sample pieces large, with any AI label. There is no acceptance step. The artist is emailed "You're in", and the inbox shows delivery status with a resend button. A decline closes the workspace.
4. **Workspace** (`/prototype/workspace/member/?artist=…`), with tabs Home, Artwork, Showings, Messages, Profile, Your page.
   - A new artist lands on "Your first piece", image first.
   - "This is your page" shows a live preview, a "how should people reach you" choice (message form, website, email, or not yet), a one-time "I made this work" confirmation, and Publish. Publish waits for approval.
   - Home shows where things stand and one next step.
5. **Showings** in one panel with three questions: Where (search places or add a new one), When (two dates, or Ongoing), Which pieces (tap tiles; the star marks the featured piece). A live preview matches the Showing Now card.
   - Ongoing showings ask "Still up?" after 60 days and leave public listings 14 days after a missed check-in.
   - After the first published showing, the artist is asked about venue-opportunity announcements.
6. **Tell people** kit after publishing a showing: an editable note with Share, Email it, Text it, Copy, and an all-day calendar invite. It is sent from the artist's own device, never by the site.

**Keeping the site honest** (gatekeeping step 1)
- **Made with AI:** a checkbox on each piece in the workspace (and on each application photo). A small "Made with AI" label then appears on the artist page, show pages, Showing Now cards, and Our Artists.
- **Report this:** a small link under each member artist's piece (artist page and show pages). Visitors pick a reason (not the artist's own work, craft or product, unlabeled AI, something else), with optional details and email. Same spam guards as the message form, five reports an hour per visitor. You're emailed; reports sit at the top of the inbox with **Hide the piece** and **Dismiss**.
- **New work:** at the bottom of the inbox, every piece on the site, newest first, each with **Hide**. Hidden pieces stay listed with **Unhide**. A hidden piece leaves the public page, its image stops being served, and the artist sees "Hidden by Artists Are Jerks" in their workspace. The artist can't undo it.
- The storage service keeps each piece's "went public" date and the hidden flag itself; ordinary saves can't change them.
- Fixed along the way: a price an artist chose to show ("Show a price") was being left out of public data.

**Visitors reaching artists**
- **Message form** on the artist page. It is emailed to the artist with the visitor as reply-to, and saved to the workspace Messages tab. The artist's address is never shown.
- **"Get an email when [artist] shows next."** Double opt-in, confirmed by a button on `/follow/confirm/`. Confirmed followers get one email when a showing is first published. Every email has an unsubscribe link (`/follow/unsubscribe/`). The artist sees the count and can download the list as CSV.
- **Spam guards on both forms:** a hidden field, a minimum time on the page, rate limits, and Cloudflare Turnstile.

## Decisions Alan has made

- Applicants may build a private page before approval.
- A published showing at an unreviewed or artist-entered venue stays public: the artist vouches for the place.
- Ongoing showings are allowed and sort after dated ones.
- Showing Now has no single featured piece. The grid is A–Z. The title is purple.
- The message form was built now; Turnstile is on.
- The venue-opportunity question comes after the first published showing.
- New work goes to the test site only.
- **The standard (September 22):** fine and visual art made to be looked at: painting, drawing, printmaking, photography, collage, mixed media, sculpture. No crafts, functional objects, or merchandise. Ceramics and glass only when made for display. AI images allowed, labeled. Nudity and violence allowed without warnings; whether to hang a piece is the venue's call. That reasoning goes in the Community Guidelines.

## Configuration outside Git

- **Cloudflare Access** on `aaj-dev`: an Allow policy for any email verified by one-time PIN (changed September 20).
- **Pages project** `artistsarejerks-astro`: automatic production and preview builds off (September 21).
- **Turnstile widget** "AAJ test site artist messages", limited to `aaj-dev.alanjust.com`, managed mode. The site key is public in `src/lib/turnstile.ts`. The secret is the encrypted `TURNSTILE_SECRET` on `aaj-community-test`.
- **Email:** the account is on Workers Paid. Cloudflare Email Service sends from `applications@aaj-mail.alanjust.com` to any address. Runtime secrets (`COMMUNITY_GATEWAY_SECRET`, Clerk keys, `ADMIN_NOTIFICATION_TO`) are not in Git.

## Test data on the test site

- **Keep:** Randy Wilson (approved, published, one piece).
- **Accounts:** alan@alanjust.com is the administrator and owns the Alan Just workspace. On September 22, Alan Just moved from the first prototype setup to a regular member artist (id `alan-just`), with 7 pieces and both showings; `/prototype/artists/alan-just/` forwards there on the test site. A backup from just before the move is at `~/aaj-backups/aaj-community-test-2026-09-22-before-alan-move.sql`. alanjust@gmail.com owns Alan Russell Just.
- **Test applicants** use Gmail plus-addresses (alanjust+test1@gmail.com is AJ Test One; +test2 is AJ Test Two).
- **Clutter:** two identical Alan Just showings (Sep 15–Oct 13) remain from earlier testing.

## Tests

`npm run test:community` runs the storage integration, account cache, workspace handoff, artist intake, messages, followers, artwork moderation, and Showing Now list tests. `npm run community:check` and `npx astro check` type-check. All pass as of this update.

## Known issues and open list

0. **Gatekeeping steps 2 and 3 (next):**
   - Step 2: draft four plain-language documents for Alan's review: Artist Terms, Community Guidelines, Privacy Notice, Site Terms.
   - Step 3: an unchecked "I agree" at application (store version and time), footer links, a short agreement line on the message and follow forms, re-agreement when terms change, and a lawyer's review before launch.
   - Small follow-up: hiding a showing's featured piece takes that showing off public listings. The showings panel doesn't yet warn the artist or skip hidden pieces in its picker.
1. **For Venues page:** waiting on Alan's OK of the benefits list.
2. **Emailed "Still up?" reminders** for ongoing showings. The check-in is only inside the workspace today.
3. **Login clarity:** make Sign up and Sign in look clearly different, and write tester instructions that name both logins (the Cloudflare code, then the site account).
4. **Region extras:** "On the road" and "Use my location". Showings already record `regionId`.
5. **Cleanups:**
   - Sample (pilot) artist and venue pages still use the typed `derivedStatusAsOfPilotDate`.
   - `cssCodeSplit: false` still bundles every page's CSS into one sitewide stylesheet.
   - The first-prototype Alan workspace code was retired on September 22. `/prototype/workspace/` and `/prototype/onboarding/artwork/` forward to `/prototype/workspaces/`. The unused `alan-workspace` and `featured` rows were deleted the same day (they are in the pre-move backup).
6. **Studio visits by appointment:** some artists show in their own studio only by appointment. Needs its own design (how a showing says "by appointment" and how visitors ask). Raised by Alan on September 22; deliberately separate from the terms work.
7. **A newly published showing only notifies followers if the artist's page is already public** at that moment.
8. **Before public launch:** decide the mailing address for follower emails. The site may not need one if the notices count as non-commercial; ask a lawyer.
9. **Safari note:** pages must `await storageReady` from `src/lib/community-storage.ts` before reading shared data. Safari can run a second page script before the storage module's top-level await finishes.

Design mockups for Showing Now, the menu, and the region picker: https://claude.ai/artifact/EGzZasV2ZZZTr18XD8uBnq
