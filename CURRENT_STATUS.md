# Artists Are Jerks: current status

Updated September 25, 2026, after the header, home-footer, Artist Tools, Why This Exists (formerly About), and Eight Ways to Look work (see "Done September 25"). Before that: the gatekeeping and terms work (steps 1–3), the navigation and footer fixes, Sign up/Sign in, the showing fixes, emailed "Still up?" reminders, the For Venues page and venue paths, account pages, self-hosted fonts, and studios by appointment. `main` matches `origin/main`. Start here; `TEST_SITE_SETUP.md` is the older chronological log.

## What the site is for

The community part of Artists Are Jerks exists to get people in front of real art in person. Think of a musician's tour calendar: the artist page is the music clip that helps a visitor decide to go, not the destination. Showing Now is the front door. The site has two parts, **See Art** (Showing Now, Places to See Art, Our Artists) and **Artist Tools** (the lessons). Design is mobile-first.

## Where things run

- **Private test site:** `https://aaj-dev.alanjust.com`, behind Cloudflare Access. New work is deployed here only.
  - Site: `npm run build:test` then `npx wrangler deploy --config wrangler.test.jsonc`
  - Storage service: `npx wrangler deploy --config community-api/wrangler.test.jsonc`
  - Database changes: `npx wrangler d1 migrations apply aaj-community-test --remote --config community-api/wrangler.test.jsonc` (applied through `0011`).
  - The storage service runs two crons: the monthly cleanup (`0 10 1 * *`) and daily "Still up?" reminders (`0 16 * * *`, 9 a.m. Pacific).
- **Public Pages site** (`artistsarejerks-astro.pages.dev`): automatic production and preview builds were turned **off** on September 21. Pushing to `main` changes nothing public.
- **Local:** `npm run dev` (port 4326) and `npm run community:dev` (port 8787), with separate local storage. `npm run community:migrate` applies local migrations.

## What's live on the test site

**Showing Now** (`/showing-now/`)
- A two-across grid of current showings, A–Z by artist last name. Tags come from the dates: "Ends Thursday", "Last day", "Just opened", "Ongoing · since June", "Opens Nov 5".
- Under the title, three short lines: "Just here to look? No account needed. Go see it.", "Make art? Put your work on this page. Join free →" (to `/join/?kind=artist`), and "Have a wall? Host local art →" (to `/for-venues/`).
- City and Search sit below the grid. After them come Ongoing (rows) and Artists to come (rows).
- "Rogue Valley, Oregon (somewhere else?)" links to the region picker, `/showing-now/regions/`.
- FPO sample tiles (Mia Chen, Luis Moreno, Rae Adams, Kenji Sato, Sam Ortiz) show on the test site and are labeled.
- **Our Artists** (`/our-artists/`) holds the roster, with "Showing now" badges.

**Header, menu, and footer**
- Every size has one header and one black menu panel, grouped into See Art and Artist Tools.
- On a phone: title, a "Showing Now" shortcut, and ☰.
- On desktop: See Art links plus **For artists** (to the join page) in the header, and **Artist sign in** floating under it on the right.
- The See Art links (header and menu) are Showing Now, Places to See Art, Our Artists, and **Why This Exists**. At 1100px, the narrowest desktop header, they still fit on one line.
- Menu utility links: Join as an artist or venue, For venues, Artist sign in. **Workspaces · Prototype** shows only to signed-in testers, and only on server-rendered pages; the home page, Why This Exists, and lessons are prerendered and never show it.
- **Footer on every page:** Artist Terms, Community Guidelines, Privacy, Site Terms, Copyright, and "© 2026 Alan Just Design · Artists Are Jerks · info@artistsarejerks.com".
  - Kept compact at Alan's request (September 24). On phones: two tight rows of links and a one-line copyright that drops "Artists Are Jerks" (it's in the header). On wide screens (900px and up): one slim line, links left, copyright right.
  - Links keep a 44px tap area through an invisible `::after` margin, so rows can sit close together.
  - The `html` background is black, so Safari's toolbar area and overscroll past the footer match it (the body stays gold).
  - **Home page footer is different** (September 25): only "© 2026 Alan Just Design · info@artistsarejerks.com", in white. `Footer.astro` takes a `minimal` prop, set by `BaseLayout` when `bodyClass` includes `homepage`. On phones it has `--toolbar-clearance` (2.5rem) of black below the line so Safari's floating toolbar doesn't cover it; Alan's iPhone showed 72px was too much. The home body is black and 100dvh tall, so Safari tints its toolbar area black to match.
  - The copyright line is white on every page (it was green).
- **Header band:** the black rule under the purple header is 6px (`--header-border`, was 18px). Other heavy borders keep 18px through `--border-heavy`.
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
   - The artist is also **emailed**: at 60 days, and a last call at 70 that names the day it comes off. The email links to `/still-up/?t=…`, where one button says "Yes, it's still up" (checks it in for today) or "No, it came down" (ends it yesterday). Opening the link changes nothing; checking in from the workspace makes the link moot. Approved artists only; one email per stage.
   - After the first published showing, the artist is asked about venue-opportunity announcements.
6. **Tell people** kit after publishing a showing: an editable note with Share, Email it, Text it, Copy, and an all-day calendar invite. It is sent from the artist's own device, never by the site.
8. **Studios by appointment** (September 24): a showing with `kind: 'studio'`, one per artist, listed from the Showings tab with **List your studio**. The artist gives a studio name, city, street address, a **Show my full address** checkbox (off by default: only the city is public), and an optional booking link. **No phone or email is ever shown** (Alan, September 24): visitors use a **Set up a visit** message form on the studio page, which emails the artist (marked "Studio visit request") with their address private. It works even if the artist's page has its own message form turned off.
   - The storage service lists it only with a public piece, never publishes a phone or email, drops unsafe booking links; the street address leaves the service only when the artist chose to show it; the listing carries the whole public portfolio (first piece is the card image).
   - Showing Now has a **Studios by appointment** section (compact rows, purple "Studio" tag). The show page becomes "Visit [Name]'s studio" with **Send a message** (jumps to the form) and **Book a visit** buttons, Directions only when the address is shown, and "In the studio" for the portfolio. Studios don't put "On view at…" tags on pieces.
   - Same 60-day "Still open for visits?" check-in, emailed reminders (studio wording), and 74-day lapse as ongoing showings. Followers get one "opening their studio by appointment" email. Tell people has a studio note. `tests/studio.mjs`.
7. **Venues** apply at `/join/venue/`, with an unchecked "I agree" to the Community Guidelines and Site Terms and an optional "Did an artist send you? Who?" (stored as `invitedBy`, shown in the inbox). Venue workspaces also have **Write to us**.
   - Arriving at `/join/?kind=artist` (from "Join free") hides "Back to choices" and shows "Not an artist? Venues: introduce your place → · Your area isn't listed? Propose it →".
   - **Approving a venue opens its workspace** for the account that applied (September 24), the same as artists; a decline closes it. The applicant's "Your venue requests" list links to the workspace. Account assignments (`/prototype/admin/accounts/`) stays as the manual fallback. Venues approved before this (e.g. Alan Just Studio, applied from alan@alanjust.com) weren't attached.
   - **Invite this place:** a showing at a place the artist typed in (venue id starting `new-`) shows "Invite this place" in the workspace. It opens the Tell people kit with a ready-made note to the owner linking to `/for-venues/`, sent from the artist's own phone or email.
   - `/for-venues/` has an "An artist sent you here?" section near the top.

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
- **Message form** on the artist page, and a **Set up a visit** form on studio pages (both from `src/lib/message-form.ts`). It is emailed to the artist with the visitor as reply-to, and saved to the workspace Messages tab. The artist's address is never shown.
- **"Get an email when [artist] shows next."** Double opt-in, confirmed by a button on `/follow/confirm/`. Confirmed followers get one email when a showing is first published. Every email has an unsubscribe link (`/follow/unsubscribe/`). The artist sees the count and can download the list as CSV.
- **Spam guards on these forms:** a hidden field, a minimum time on the page, rate limits, and Cloudflare Turnstile.

**Artist Tools pages** (redesigned September 25)
- One shared look: title, a short left- or center-aligned intro, then the content on the first screen. Cream cards (`--color-cream`) with a black border; black number badges; purple Averia labels; design tokens only; Ira Glass copy with unspaced em dashes.
- **What's a Jerk?** (`/whats-a-jerk/`): 12 cream cards with short behavior titles, "What's underneath" and "Try saying"; "The bigger picture" at the end.
- **How Art Works** (`/how-art-works/`): three jump chips and three cards: Gallery, Spectacle, and **Everyday art** (renamed from "General Purpose Art"; Alan hasn't objected). Traits and examples always visible.
- **Who Is Walter Benjamin?** (`/walter-benjamin/`, replaces the Benjamin Learning Wheel; `/benjamin-wheel/` redirects). Built like the Art History Wheel on phones: five swipeable pills (Aura, Copies, The lens, History, Politics) and a black panel with the positions as text rows and thumbnails where the site has an image (six do; Rothko, Muybridge, Freud, the Futurists, and Whistler don't). Desktop shows the positions in columns. The copy lives in the page; `src/data/benjamin-wheel.json` is now unused. The menu lists it as its own Artist Tools item, not under Art History Wheel.
- **Thinking Like an Artist** (`/thinking-like-an-artist/`): a left-aligned intro for newer artists (draft B), then three pills (Wanting to be seen, Fear, Choices). Each tool's layers step light to dark (cream, gold, orange, crimson, black). Fear ends on a hopeful "What's actually true" layer (September 25, draft B).
- **Gatekeepers** (`/gatekeepers/`): an artist's path with five gates, then five gatekeeper pills with a black panel, five number tiles, and a closing card with a Sources list. **Every number is footnoted to a source; add the source before adding a number.** Unsupported claims from the old page were dropped or corrected (the old "Yale research" is Fraiberger et al., Science 2018; "90% of sales in NYC", "70% imposter syndrome", "1–2 new artists a year", and the $55M debt survey couldn't be sourced).
- **What's a Jerk?** was reworked again: it opens with the moody-artist stereotype and three cards (Good jerks, Bad jerks, Normies), then **eight visitor moments** ("You read the wall label three times…"), each with What it felt like, What was actually going on, a green "It's not you," and "If you want to keep talking" (lines chosen to calm things down, never to argue back). A black "If you're an artist" card links to Thinking Like an Artist. The old twelve behaviors are gone.
- **Eight Ways to Look** (`/eight-ways-to-look/`, new, in the menu after Thinking Like an Artist): the eight thinkers from the old About page as cards: a plain title, one-line idea, a black "Try it" prompt, Good jerk and Bad jerk notes (Normie lines removed at Alan's request), and "After [thinker]". Data in `src/data/thinkers.ts`.
- **Why This Exists** (`/about/`, renamed from About on September 25 and moved into the header's See Art links after Our Artists; the ☰ menu lists it there too, not in the small utility links) is now Alan's short story: art school (not the right one), the turn to illustration, graphic and packaging design, having been a jerk ("that guy still shows up now and then"), and why the site exists: galleries are worth reaching for, but you need to be seen meanwhile, like musicians playing local bars. "More about me →" opens alanjust.com/about in a new tab. Buttons: See what's showing now, Show your work. Showing Now ends with "Why a site for local art? Here's the story →" linking to it.
- **The Seven-Minute Look** (`/seven-minute-look/`, replaces the Attention Lab; `/attention-lab/` redirects; in Artist Tools after Eight Ways to Look). A guided look done in person: a timer runs three looks (0:00–0:15 first glance, to 3:00 follow your eye, to 7:00 keep finding things, with **Done looking** in the last one), dings and spoken cues (both can be turned off), and keeps the screen awake. Then six questions, each with "What did you see?" and a 0–5 score, and a running total out of 30. Nothing is saved. Timer approach, the two ding files (`public/sounds/`), and the iPhone audio unlock come from Alan's Life Drawing Timer web app (`~/Desktop/lifedrawingtimer-web`), ported to plain JavaScript. Every show page has "Standing in front of one? Try the Seven-Minute Look →" under On the wall. A quiet last line links to the Hidden Grammar of Art corpus (new tab). `src/data/attention-wheel-sample.json` is now unused.
- Movements, Artists in History, and the Art History Wheel weren't touched; Alan considers them already in line.

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
- **Venues (checked September 24):** three approved, visible venue records.
  - **Test Venue — Not Real.** (Ashland).
  - **Alan Just Studio**, applied for from alan@alanjust.com and attached to that account on September 24 (so Alan's account page shows both workspaces).
  - **Leo's Brewpub and Grill** (Medford). A fictional sample made into a real venue record on September 24 (id `venue-leos-brewpub`, the id its two published showings already used). Address "101 Prototype Way" is made up; the description says it's a test venue; private contact is "Alan Just (test venue)" at info@.
  - Artist-typed places with no venue record: "Museum Test — Not Real" (Alan Just) and "Alan Russell Just Home Studio" (Alan Russell Just). These get **Invite this place** in the workspace.
- **Accounts:** alan@alanjust.com is the administrator and owns the Alan Just artist page (id `alan-just`, 7 pieces, both showings; moved from the first prototype setup on September 22, backup at `~/aaj-backups/aaj-community-test-2026-09-22-before-alan-move.sql`). alanjust@gmail.com owns Alan Russell Just.
- **Alan's studio listing** still holds the phone and email he typed before phones were removed. They're private (never published) and clear the next time he edits and saves the studio.
- **Test applicants** use Gmail plus-addresses: alanjust+test1@gmail.com is AJ Test One, alanjust+test2@gmail.com is AJ Test Two. Both applied before sample photos and the agreement existed, so the join page will ask them for both. Use alanjust+test3@gmail.com (and up) for a fresh run.
- **Tester handout** ("Come kick the tires") for Alan's artist friends, shared by link and meant to be sent by text: https://claude.ai/artifact/5NMqFvPvUn4DvWP7ik6RWJ. Its source is a scratchpad file, so edit it by reading the artifact first.
  - It opens as an **invitation**: what the site is and what testing means, a big **Open the test site →** button to `https://aaj-dev.alanjust.com/showing-now/` (opens in a new tab), and three lines of what to expect.
  - Then **the guide**: the two doors in the order people meet them. Door 1 is the Cloudflare gate code, then Showing Now with no other login. Door 2, the site account, appears only after tapping Join free, For artists, or Artist sign in.
  - Step-by-step sections: just looking, putting your art up (with the terms checkbox), coming back later, and how to report problems (Write to us or info@).
  - Three reminders to save the site password, including a tip box at the step where it's made. The gate code won't get anyone into their page.
  - Version 10 (September 25): About is called Why This Exists, in the top bar. Version 9: a new "While you're there: the Artist Tools" section lists all six lessons and the About page; the fine print is "at the bottom of every page except the front door." Version 8: the sign-up/sign-in pages are described by their tags (green FIRST TIME HERE, purple COMING BACK · Welcome back); it mentions Studios by appointment and List your studio; and it invites testers to pass "Have a wall? Host local art" to venue owners they know.
  - Keep it in step with the site's navigation and screens.
- **Clutter:** two identical Alan Just showings (Sep 15–Oct 13) remain from earlier testing.

## Tests

`npm run test:community` runs the storage integration, account cache, workspace handoff, artist intake (including terms), messages, followers, artwork moderation, member notes, Still up reminders, and Showing Now list tests. The artist-application tests read the current terms version from `community-api/terms.ts`. `npm run community:check` and `npx astro check` type-check. All pass as of this update.

## Open list

**Optional builds** (named in the Privacy Notice)
1. A self-serve "delete my account" button (today artists write in).

**Later**
2. **Region extras:** "On the road" and "Use my location". Showings already record `regionId`.
3. **Cleanups:**
   - Sample (pilot) artist and venue pages still use the typed `derivedStatusAsOfPilotDate`.
   - `cssCodeSplit: false` still bundles every page's CSS into one sitewide stylesheet, so global rules must be namespaced.
   - `/prototype/workspace/` and `/prototype/onboarding/artwork/` forward to `/prototype/workspaces/` (the first-prototype Alan workspace was retired September 22).

## Done September 25

- Header band thinned to 6px sitewide.
- Home footer trimmed to the copyright line, lifted above Safari's toolbar, with a black body behind it.
- All five Artist Tools pages redesigned (details above), each mocked up first and approved by Alan. Benjamin page renamed and moved; `about.astro` link updated.
- Gatekeepers gained a fifth tile: 78% of the value of $10 million-plus art auction sales in 2025 was in the US (Art Basel/UBS report, confirmed in the PDF along with "39 of the top 50").
- Thinking Like an Artist's Fear tool ends on a hopeful "What's actually true" layer; its warning note now says it "goes to some dark places before it comes back up." The earlier Fear layers moved one shade lighter so black stays the last step. Not yet seen on a phone.
- What's a Jerk? rebuilt: the stereotype, three kinds of jerks, and eight visitor moments replacing the twelve behaviors.
- About rewritten as Alan's story, then renamed **Why This Exists** and moved into the header after Our Artists; Showing Now ends with a link to it. "More about me" links to alanjust.com/about in a new tab.
- New page Eight Ways to Look, added to the Artist Tools menu after Thinking Like an Artist.
- The Attention Lab became The Seven-Minute Look, with a real timer and a link from every show page.
- New tokens: `--color-cream`, `--toolbar-clearance`, `--max-width-wide`.

## Done September 24

- **Sign up and Sign in look different.** `src/components/AuthIntro.astro` puts a colored tag and heading above each Clerk box ("First time here · Create your account" in green, "Coming back · Welcome back" in purple), a save-your-password line on sign-up, a "not the gate code" line on sign-in (test site only), and a link to the other page. Clerk's own box text is unchanged.
- **Hidden featured piece.** When a showing's featured piece is hidden (or made private), the next piece still on view is featured instead; the showing leaves the listings only when none are left. The workspace skips hidden pieces in the picker and explains on the showing card.
- **Follower notices for showings published before the page was public.** When a page goes public (the artist publishes it, or it's approved), followers hear about any published showings that were waiting. Each showing is still announced only once.
- **Emailed "Still up?" reminders** (migration `0011`, `tests/still-up.mjs`), described under Showings above.
- **Fonts are served from the site** (`public/fonts/`, `src/styles/fonts.css`): Spicy Rice and Averia Sans Libre, Latin subsets. Google Fonts is gone, and the unused Inter was dropped. The Privacy page no longer lists Google Fonts.
- **The Figma capture script is gone** from every page (it loaded from mcp.figma.com). The `figma-mobile` capture class remains but no longer loads anything from Figma.
- **Follower notices carry the mailing address** (Artists Are Jerks · Alan Just Design · 2520 Lyman Ave, Medford, OR 97504), the address filed with the Copyright Office.
- **Account assignments** (`/prototype/admin/accounts/`) lists each account by email (from its artist or venue request; otherwise "Account ending …") with "Artist: …" and "Runs venue: …" (or "Doesn't run a venue"). "Venue" here means a place the account owns, not where its art is showing. A "Venues with no owner account" list at the bottom names approved venues set up by hand (today Test Venue — Not Real. and Leo's Brewpub and Grill).
- **Account page** (`/account/`) reworded: "Your pages" with a line under each workspace link, a nudge to the other role (artist to venue or venue to artist), and a test-site note. Its first sentence refers to the "Signed in as" bar above, which Alan's screenshot didn't show; Alan chose to leave it as is.
- **For Venues page** (`/for-venues/`): Alan approved the benefits (free listing, walls that change on their own, artists bring their own people, nothing to handle on sales, still listed between shows). It covers how it works and fair questions, with "Introduce your place →" to `/join/venue/`. Linked from the menu ("For venues") and from Places to See Art ("Own a café, brewpub, or shop? Hang local art on your walls →"). Signed-out owners who tap Introduce now land on Create your account, then return to the venue form (it used to send them to Sign in).

## Working notes

- **Local dev server goes stale on component styles:** after editing a component's `<style>` (e.g. the footer), `npm run dev` sometimes keeps serving the old CSS. Restart it, or check the built CSS in `dist-test/_assets/` after `npm run build:test`. Judge layouts from Alan's real-device screenshots, not the automated preview.
- **Safari:** pages must `await storageReady` from `src/lib/community-storage.ts` before reading shared data. Safari can run a second page script before the storage module's top-level await finishes.
- **Approval is per artist, not per showing.** Alan approves each artist once; their showings go live when they publish them.

Design mockups for Showing Now, the menu, and the region picker: https://claude.ai/artifact/EGzZasV2ZZZTr18XD8uBnq
