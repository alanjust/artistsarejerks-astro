# Artists Are Jerks: current status

Updated September 24, 2026, after the gatekeeping and terms work (steps 1–3), the navigation fixes, and the footer tightening. `main` matches `origin/main`. Start here; `TEST_SITE_SETUP.md` is the older chronological log.

## What the site is for

The community part of Artists Are Jerks exists to get people in front of real art in person. Think of a musician's tour calendar: the artist page is the music clip that helps a visitor decide to go, not the destination. Showing Now is the front door. The site has two parts, **See Art** (Showing Now, Places to See Art, Our Artists) and **Artist Tools** (the lessons). Design is mobile-first.

## Where things run

- **Private test site:** `https://aaj-dev.alanjust.com`, behind Cloudflare Access. New work is deployed here only.
  - Site: `npm run build:test` then `npx wrangler deploy --config wrangler.test.jsonc`
  - Storage service: `npx wrangler deploy --config community-api/wrangler.test.jsonc`
  - Database changes: `npx wrangler d1 migrations apply aaj-community-test --remote --config community-api/wrangler.test.jsonc` (applied through `0010`).
  - The storage service runs a monthly cleanup (cron `0 10 1 * *`).
- **Public Pages site** (`artistsarejerks-astro.pages.dev`): automatic production and preview builds were turned **off** on September 21. Pushing to `main` changes nothing public.
- **Local:** `npm run dev` (port 4326) and `npm run community:dev` (port 8787), with separate local storage. `npm run community:migrate` applies local migrations.

## What's live on the test site

**Showing Now** (`/showing-now/`)
- A two-across grid of current showings, A–Z by artist last name. Tags come from the dates: "Ends Thursday", "Last day", "Just opened", "Ongoing · since June", "Opens Nov 5".
- Under the title: "Just here to look? No account needed. Go see it." and "Make art? Put your work on this page. Join free →" (to `/join/?kind=artist`).
- City and Search sit below the grid. After them come Ongoing (rows) and Artists to come (rows).
- "Rogue Valley, Oregon (somewhere else?)" links to the region picker, `/showing-now/regions/`.
- FPO sample tiles (Mia Chen, Luis Moreno, Rae Adams, Kenji Sato, Sam Ortiz) show on the test site and are labeled.
- **Our Artists** (`/our-artists/`) holds the roster, with "Showing now" badges.

**Header, menu, and footer**
- Every size has one header and one black menu panel, grouped into See Art and Artist Tools.
- On a phone: title, a "Showing Now" shortcut, and ☰.
- On desktop: See Art links plus **For artists** (to the join page) in the header, and **Artist sign in** floating under it on the right.
- Menu utility links: Join as an artist or venue, Artist sign in, About. **Workspaces · Prototype** shows only to signed-in testers, and only on server-rendered pages; the home page, About, and lessons are prerendered and never show it.
- **Footer on every page:** Artist Terms, Community Guidelines, Privacy, Site Terms, Copyright, and "© 2026 Alan Just Design · Artists Are Jerks · info@artistsarejerks.com".
  - Kept compact at Alan's request (September 24). On phones: two tight rows of links and a one-line copyright that drops "Artists Are Jerks" (it's in the header). On wide screens (900px and up): one slim line, links left, copyright right.
  - Links keep a 44px tap area through an invisible `::after` margin, so rows can sit close together.
  - The `html` background is black, so Safari's toolbar area and overscroll past the footer match it (the body stays gold).
- **Home page** (`/`) stays the "Studio Entrance" illustration with the painted "Start Here" sign, which links to Showing Now. Alan decided to keep it (September 24); on his phone the sign is large and obvious. Shared links and the tester handout go straight to Showing Now.

**Joining and onboarding**
1. **Apply** (`/join/?kind=artist`). Signed-out visitors create an account first, then return. Four fields (name, city, what you make, where we can see your work), **two or three photos**, and an unchecked **"I agree"** to the Artist Terms and Community Guidelines. The email comes from the account.
   - The form spells out the standard: art made to be looked at, not crafts, useful objects, or merchandise; ceramics and glass only when made for display; AI images welcome if labeled.
   - The photos become the first pieces on the artist's page. You're emailed about the request only once they arrive. A request saved without them asks for just the photos (and agreement) next time.
2. **Private page opens immediately.** Applying creates the artist record and workspace membership together. Nothing is public until approval.
3. **Approval** in `/prototype/admin/inbox/`. Each artist request shows its sample pieces large, with any AI label, and which terms version the artist agreed to. There is no acceptance step. The artist is emailed "You're in", and the inbox shows delivery status with a resend button. A decline closes the workspace.
4. **Workspace** (`/prototype/workspace/member/?artist=…`), with tabs Home, Artwork, Showings, Messages, Profile, Your page, and a **Write to us** link at the top.
   - A new artist lands on "Your first piece", image first.
   - "Your page" shows a live preview, a "how should people reach you" choice (message form, website, email, or not yet), a one-time "I made this work" confirmation, the terms agreement when it's needed, and Publish. Publish waits for approval.
   - Home shows where things stand and one next step.
5. **Showings** in one panel with three questions: Where (search places or add a new one), When (two dates, or Ongoing), Which pieces (tap tiles; the star marks the featured piece). A live preview matches the Showing Now card.
   - Ongoing showings ask "Still up?" after 60 days and leave public listings 14 days after a missed check-in.
   - After the first published showing, the artist is asked about venue-opportunity announcements.
6. **Tell people** kit after publishing a showing: an editable note with Share, Email it, Text it, Copy, and an all-day calendar invite. It is sent from the artist's own device, never by the site.
7. **Venues** apply at `/join/venue/`, with an unchecked "I agree" to the Community Guidelines and Site Terms. Venue workspaces also have **Write to us**.

**Terms and policies** (gatekeeping steps 2 and 3)
- Five pages: `/artist-terms/`, `/guidelines/`, `/privacy/`, `/terms/` (Site Terms), `/copyright/`, sharing the layout `src/components/LegalPage.astro`. Each shows "Version 1 · effective September 24, 2026".
- The current version is in `community-api/terms.ts` (`TERMS_VERSION`, `TERMS_DATE`). Change both when the terms change, and edit the page text.
- Applications store `terms: {version, agreedAt}`; an earlier agreement moves to `termsHistory`.
- An artist page can't go from private to public until its artist has agreed to the current version (enforced by the storage service). Home tells the artist when the terms have changed. Pages already public stay public. Venues aren't asked again when terms change, since an administrator controls their visibility.
- Message, follow, and report forms carry a one-line "Sending this means you're OK with our Site Terms and Privacy Notice."
- Artists who joined before September 24 (Alan Just, Randy Wilson, Alan Russell Just) haven't agreed yet; they'll be asked the next time one of their pages goes from private to public.
- Drafts and review history: "The Fine Print", https://claude.ai/artifact/SPTdrvFNQeW6vwjpyM2Veq

**Keeping the site honest** (gatekeeping step 1)
- **Made with AI:** a checkbox on each piece in the workspace (and on each application photo). A small "Made with AI" label then appears on the artist page, show pages, Showing Now cards, and Our Artists.
- **Report this:** a small link under each member artist's piece (artist page and show pages). Visitors pick a reason (not the artist's own work, craft or product, unlabeled AI, something else), with optional details and email. Same spam guards as the message form, five reports an hour per visitor. You're emailed; reports sit near the top of the inbox with **Hide the piece** and **Dismiss**.
- **New work:** at the bottom of the inbox, every piece on the site, newest first. **Hide** asks for a reason (craft or product, not their own work, unlabeled AI, copyright notice, other), takes the piece off the site, stops serving its image, and emails the artist the reason. The workspace shows why, with a "Write to us about this" button. **Unhide** puts it back and emails "it's back." The artist can't undo a hide.
- **Write to us:** notes from artists and venues are emailed to you with the member as reply-to, and wait under **Notes** at the top of the inbox with **Mark handled**. Ten notes a day per account.
- **Monthly cleanup:** visitor messages and member notes older than two years, and reports closed more than a year ago, are deleted on the 1st of each month, as the Privacy Notice promises.
- The storage service keeps each piece's "went public" date and the hidden flag and reason itself; ordinary saves can't change them.

**Visitors reaching artists**
- **Message form** on the artist page. It is emailed to the artist with the visitor as reply-to, and saved to the workspace Messages tab. The artist's address is never shown.
- **"Get an email when [artist] shows next."** Double opt-in, confirmed by a button on `/follow/confirm/`. Confirmed followers get one email when a showing is first published. Every email has an unsubscribe link (`/follow/unsubscribe/`). The artist sees the count and can download the list as CSV.
- **Spam guards on these forms:** a hidden field, a minimum time on the page, rate limits, and Cloudflare Turnstile.

## Decisions Alan has made

- Applicants may build a private page before approval.
- A published showing at an unreviewed or artist-entered venue stays public: the artist vouches for the place.
- Ongoing showings are allowed and sort after dated ones.
- Showing Now has no single featured piece. The grid is A–Z. The title is purple.
- The venue-opportunity question comes after the first published showing.
- New work goes to the test site only.
- **The standard (September 22):** fine and visual art made to be looked at: painting, drawing, printmaking, photography, collage, mixed media, sculpture, and fiber and textile art made for the wall. No crafts, functional objects, or merchandise. Ceramics and glass only when made for display. AI images allowed, labeled. Nudity and violence allowed without warnings; whether to hang a piece is the venue's call.
- **Terms (September 23–24):**
  - The site is run by Alan Just Design, Alan's sole proprietorship, in Medford, Oregon (Jackson County courts).
  - No lawyer's review; Alan accepts the risk for a lightweight project.
  - Artist accounts are for people 18 and up.
  - The site won't post artists' work on its own social media; the license covers link previews only.
  - 60 days' notice before the site ever charges. 30 days' notice if it shuts down, with no download promise.
  - Visitor messages are deleted after two years.
- **Home page (September 24):** keep the studio illustration as the front door; don't redirect `/` to Showing Now.
- **Navigation (September 24):** Showing Now answers "do I need an account?" and "where do I join?" right under the title; "Your account / Sign in" became "Artist sign in"; desktop gets "For artists".

## Configuration outside Git

- **Cloudflare Access** on `aaj-dev`: an Allow policy for any email verified by one-time PIN (changed September 20).
- **Pages project** `artistsarejerks-astro`: automatic production and preview builds off (September 21).
- **Turnstile widget** "AAJ test site artist messages", limited to `aaj-dev.alanjust.com`, managed mode. The site key is public in `src/lib/turnstile.ts`. The secret is the encrypted `TURNSTILE_SECRET` on `aaj-community-test`.
- **Email:** the account is on Workers Paid. Cloudflare Email Service sends from `applications@aaj-mail.alanjust.com` to any address. Runtime secrets (`COMMUNITY_GATEWAY_SECRET`, Clerk keys, `ADMIN_NOTIFICATION_TO`) are not in Git.
- **Public contact address:** info@artistsarejerks.com, an alias of admin@artistsarejerks.com. Show info@ publicly, never admin@.
- **Copyright agent:** registered with the U.S. Copyright Office on September 23, DMCA-1080994, as Alan Just d/b/a Alan Just Design, 2520 Lyman Ave, Medford, OR 97504. Renew by September 2029. The filing lists admin@; the Copyright page shows info@. Alan may amend the filing to info@.

## Test data and testers

- **Keep:** Randy Wilson (approved, published, one piece).
- **Accounts:** alan@alanjust.com is the administrator and owns the Alan Just artist page (id `alan-just`, 7 pieces, both showings; moved from the first prototype setup on September 22, backup at `~/aaj-backups/aaj-community-test-2026-09-22-before-alan-move.sql`). alanjust@gmail.com owns Alan Russell Just.
- **Test applicants** use Gmail plus-addresses: alanjust+test1@gmail.com is AJ Test One, alanjust+test2@gmail.com is AJ Test Two. Both applied before sample photos and the agreement existed, so the join page will ask them for both. Use alanjust+test3@gmail.com (and up) for a fresh run.
- **Tester handout** ("Come kick the tires") for Alan's artist friends, shared by link and meant to be sent by text: https://claude.ai/artifact/5NMqFvPvUn4DvWP7ik6RWJ. Its source is a scratchpad file, so edit it by reading the artifact first.
  - It opens as an **invitation**: what the site is and what testing means, a big **Open the test site →** button to `https://aaj-dev.alanjust.com/showing-now/` (opens in a new tab), and three lines of what to expect.
  - Then **the guide**: the two doors in the order people meet them. Door 1 is the Cloudflare gate code, then Showing Now with no other login. Door 2, the site account, appears only after tapping Join free, For artists, or Artist sign in.
  - Step-by-step sections: just looking, putting your art up (with the terms checkbox), coming back later, and how to report problems (Write to us or info@).
  - Three reminders to save the site password, including a tip box at the step where it's made. The gate code won't get anyone into their page.
  - Keep it in step with the site's navigation and screens.
- **Clutter:** two identical Alan Just showings (Sep 15–Oct 13) remain from earlier testing.

## Tests

`npm run test:community` runs the storage integration, account cache, workspace handoff, artist intake (including terms), messages, followers, artwork moderation, member notes, and Showing Now list tests. The artist-application tests read the current terms version from `community-api/terms.ts`. `npm run community:check` and `npx astro check` type-check. All pass as of this update.

## Known issues and open list

1. **For Venues page:** waiting on Alan's OK of the benefits list.
2. **Emailed "Still up?" reminders** for ongoing showings. The check-in is only inside the workspace today.
3. **Sign up and Sign in look nearly the same** (both Clerk boxes). Make them clearly different, e.g. "New here? Create your account" and "Welcome back."
4. **Region extras:** "On the road" and "Use my location". Showings already record `regionId`.
5. **Hidden featured piece:** hiding a showing's featured piece takes that showing off public listings. The showings panel doesn't yet warn the artist or skip hidden pieces in its picker.
6. **A newly published showing only notifies followers if the artist's page is already public** at that moment.
7. **Follower emails and a mailing address:** decide whether follower notices should carry a mailing address (the copyright agent's address is already public).
8. **Optional builds named in the Privacy Notice:** a self-serve "delete my account" button (today artists write in), and serving fonts from the site itself so Google Fonts drops off the privacy list.
9. **Studio visits by appointment:** some artists show in their own studio only by appointment. Needs its own design (how a showing says "by appointment" and how visitors ask).
10. **Cleanups:**
    - Sample (pilot) artist and venue pages still use the typed `derivedStatusAsOfPilotDate`.
    - `cssCodeSplit: false` still bundles every page's CSS into one sitewide stylesheet, so global rules must be namespaced.
    - `/prototype/workspace/` and `/prototype/onboarding/artwork/` forward to `/prototype/workspaces/` (the first-prototype Alan workspace was retired September 22).
11. **Local dev server goes stale on component styles:** after editing a component's `<style>` (e.g. the footer), `npm run dev` sometimes keeps serving the old CSS. Restart it, or check the built CSS in `dist-test/_assets/` after `npm run build:test`. Judge layouts from Alan's real-device screenshots, not the automated preview.
12. **Safari note:** pages must `await storageReady` from `src/lib/community-storage.ts` before reading shared data. Safari can run a second page script before the storage module's top-level await finishes.

Design mockups for Showing Now, the menu, and the region picker: https://claude.ai/artifact/EGzZasV2ZZZTr18XD8uBnq
