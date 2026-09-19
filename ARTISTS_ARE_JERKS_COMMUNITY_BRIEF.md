# Artists Are Jerks Community Platform Brief

Status: living product brief

Launch region: Rogue Valley, Oregon

Last updated: September 16, 2026

## Purpose

Artists Are Jerks will help people discover visual art that can be seen in person, especially work by artists with limited or no gallery representation. Artists may show in restaurants, brewpubs, studios, cooperatives, galleries, museums, and other local spaces.

The public site's lead question is:

> What art can I go see now, and where?

The platform will also give invited artists a permanent public presence, artwork documentation, private contact management, email announcements, and eventual publishing tools for Instagram and other social platforms.

Artists Are Jerks will remain free at launch. The service is currently a volunteer community project. Future stewardship may use optional memberships, sponsorships, grants, advanced communication tools, or paid services while preserving free artist participation and public discovery.

## Existing Artists Are Jerks site

The current Artists Are Jerks identity and editorial site remain intact. Existing and future material may include:

- Current menu items and pages
- The art history wheel
- How-to material, such as photographing artwork
- A color theory primer
- New ideas, approaches, essays, and opinion pieces
- A possible blog or continuing editorial section

The homepage's illustrated **Start Here** action will eventually lead into local art discovery. The detailed page composition remains open, but **Showing Now** leads the experience and artist discovery supports it.

## Geographic structure

The first launch covers the Rogue Valley. City distinctions matter because visitors may be willing to see art in one city but not travel to another.

Initial cities include:

- Ashland
- Medford
- Grants Pass
- Central Point

The database must treat region and city as separate geographic concepts. Visitors can browse the Rogue Valley as a whole or narrow results to a city.

Proposed public routes:

```text
artistsarejerks.com/rogue-valley/showing-now
artistsarejerks.com/medford-oregon/showing-now
artistsarejerks.com/ashland-oregon/showing-now
artistsarejerks.com/grants-pass-oregon/showing-now
artistsarejerks.com/central-point-oregon/showing-now
```

Each artist receives a stable public address:

```text
artist-name.artistsarejerks.com
```

Geography is stored as data and does not determine the artist's permanent address. An artist may appear in more than one regional or city view through their exhibitions.

## Curation and admission

Artists are initially invited and approved by the site administrator. Later, artists may request admission, but acceptance remains at the administrator's discretion.

Artists Are Jerks is a curated visual-art service. It is not intended as a general crafts marketplace. Work such as breadboards, jewelry, and similar craft-market offerings may fall outside the site's scope. A concise public eligibility statement still needs to be written.

Acceptance of an artist provides the primary moderation threshold for their work. The site administrator retains the discretion to remove public visibility from any artist page or business venue for any reason.

An administrator visibility restriction:

- Removes the artist or venue from public pages and discovery
- Preserves the account and stored information
- Can be reversed by an administrator
- Cannot be overridden by the artist or venue

## Public discovery

### Showing Now

Showing Now is the primary public experience. It displays artwork that visitors can physically see within the current date range.

It should answer:

- What is showing?
- Who made it?
- Where can I see it?
- What city is it in?
- When does the showing end?
- Is the work available for sale, if the artist chooses to say?

An exhibition automatically leaves Showing Now after its end date. The exhibition and artwork remain available as history unless hidden or archived.

Possible supporting discovery controls include:

- City
- Artist name
- Medium
- Venue
- Current, upcoming, and recently shown
- Search

Featured artists may appear in a narrower column or sidebar. This provides discovery for artists who are not currently showing.

### Artist pages

An artist page remains available throughout the year and may include:

- Artist name and biography
- Practice and media
- Selected public artwork
- Current and upcoming exhibitions
- Past exhibition history
- Available, sold, and not-for-sale work
- Artist-controlled contact methods
- Newsletter and social links

Artists can take their own page offline while retaining their account, artwork, contacts, and history. The exact effect of an artist-controlled offline state on active Showing Now entries remains to be finalized.

## Artwork records

An artist is the public subject. Individual artwork records make it possible to manage each work's image, details, sales state, display location, and history.

Each artwork has independent controls for:

- Visibility on the artist's public page
- Inclusion in a physical exhibition
- Sales presentation
- Private archive status

Sales presentation options should include:

- Public price
- Not for sale
- Contact the artist for price
- Private price visible only to the artist

A sold artwork may remain public as part of the artist's portfolio. Archiving is a separate private action that removes a work from public display without deleting its record.

Artists Are Jerks will not process sales during the initial phase. Buyers deal directly with artists.

## Image ingestion

The Hidden Grammar of Art catalog is the technical and interaction reference for artwork ingestion. Its useful patterns include:

- Image-first interaction
- Click, drag-and-drop, and clipboard paste
- Immediate preview and removal
- Optional metadata
- Separate archival, display, and thumbnail image derivatives
- Browser-side resizing and format handling
- Server-side image validation
- Clear processing and success states

Artists Are Jerks should make the first artist upload even shorter:

1. Add an image.
2. See it immediately while it saves as a private draft.
3. Add a title, with **Untitled** accepted.
4. Select or enter a medium.
5. Publish it to the artist page.
6. Optionally add dimensions, year, description, price, exhibition, email, and social publishing information.

The artist's name comes from their account and should not be requested for each artwork.

The ingestion experience should support autosave, drafts, inline errors, upload progress, recovery, and mobile photo selection. Batch upload may follow after the single-artwork flow is stable.

## Exhibitions and venue authority

An exhibition connects:

- An artist
- A venue
- Start and end dates
- A selected set of artworks

The artist controls exhibition creation and artwork selection. Venues must never initiate showing information.

Initial workflow:

```text
Artist identifies the venue and enters the dates
        ↓
Artist selects the displayed artworks
        ↓
The showing becomes public
        ↓
The venue receives an informational alert when contact information is available
        ↓
The administrator may invite the venue to participate
```

Venue confirmation is not required for publication. The assumption is that artists will not direct visitors to a location where their work is unavailable.

The administrator may first learn about a venue through an artist's exhibition entry, contact the venue, and invite it to join.

## Venue participation

Venues play a supporting role. Relevant venue types include:

- Restaurants
- Brewpubs
- Studios
- Cooperatives
- Galleries
- Museums
- Other businesses or organizations that display visual art

A participating venue may manage its business information, location, hours, contact details, and private mailing list. Its public presence surfaces through artist-initiated exhibitions. Venue names on Showing Now cards should eventually link to a dedicated venue page containing a map and the venue's own website when available.

Venues may announce an artist's exhibition to their own audience. Artists and venues retain separate contact lists. They may collaborate on announcement content, but neither party automatically receives access to the other's contacts.

## Artist contacts and communication

Each artist receives a private, spreadsheet-like contact manager for people such as:

- Collectors and buyers
- Friends and supporters
- Venue and gallery contacts
- Curators and arts organizations
- Press contacts
- Other artists

Possible fields include name, email, phone, organization, notes, tags, mailing-list status, and communication history.

Artists can use selected artwork and exhibition information in email announcements regardless of geography.

Artists choose which personal contact details are public. Each item should have a discrete public/private control. Possible public contact methods include:

- Email address
- Phone or text number
- Link to an external contact page
- A form on the artist's AAJ page that forwards an inquiry without revealing the artist's email address

The precise contact-form behavior remains open.

## Social publishing

Artists Are Jerks is the source of record for artwork. An artist should eventually be able to:

1. Upload and document a work once.
2. Publish it on their AAJ artist page.
3. Assign it to an exhibition.
4. Include it in an email announcement.
5. Prepare and publish or schedule it for Instagram or another supported social platform.

Social platforms are optional destinations. The artwork record remains useful if a platform changes its APIs or permissions.

## Reporting and sensitive content

Public artist and artwork pages should provide a report link. Reports go to the administrator or a designated volunteer moderator.

A policy for violent imagery, explicit sexual content, warnings, and age-sensitive presentation still needs to be developed. The initial artist-approval process reduces risk but does not replace a reporting and review mechanism.

## Privacy, control, and portability

Artists control the visibility of their public contact details, artwork, prices, and page. Administrative restrictions take precedence over artist or venue visibility choices.

Artists must be able to export:

- Artwork records
- Artwork images
- Contact data
- Exhibition history

Contact lists remain private to their owning artist or venue.

## Inactivity

When an artist page has not been touched or updated for six months, the system alerts:

- The artist
- The site administrator

The first alert does not automatically take the page offline. Reminder cadence and administrator actions remain open.

## Initial roles

### Visitor

- Browse Showing Now by region and city
- Discover artists, artwork, and associated venues
- Contact artists through artist-enabled methods
- Report public content

### Artist

- Manage a permanent public page
- Upload and document artwork
- Choose public, sales, and archive states
- Initiate exhibitions and select displayed artwork
- Manage contacts and announcements
- Control public contact information
- Take their page offline
- Export their data

### Venue

- Maintain business details after being invited
- Receive informational alerts about artist-initiated exhibitions
- Maintain a private contact list
- Send venue announcements
- Cannot initiate or control showing information

### Administrator

- Invite and approve artists
- Review later artist applications
- Invite venues after artists identify them
- Receive reports and inactivity alerts
- Hide or restore any artist or venue at discretion
- Manage regional and city information

## Conceptual records

This is a product model, not a committed database schema:

- Accounts and roles
- Artists
- Venues
- Regions and cities
- Artworks and image derivatives
- Exhibitions
- Exhibition artworks
- Artist and venue contacts
- Campaigns and recipients
- Social publishing jobs
- Reports and moderation actions
- Visibility and inactivity events

The new community data model must be designed deliberately. The archived Art Lab database structure must not be reused.

## First-success moments

Artist success:

> The artist has a private account, a permanent page address, and one published artwork.

Exhibition success:

> The artist has named a venue, supplied dates, selected displayed work, and made the showing discoverable.

Venue success:

> An invited venue has confirmed its business information and can announce the artist's showing to its own audience.

Visitor success:

> A visitor finds artwork currently showing in a city they are willing to visit and can act on the location information.

## Research before Figma

Complete a focused comparison of:

1. Instagram account creation, first media upload, drafts, publishing, and professional-account progression.
2. Artist inventory systems for artwork metadata, availability, sales, and archives.
3. Business and venue systems for location information, invitations, alerts, and account claiming.

The research deliverable should contain:

- A screen-by-screen pattern summary
- A friction inventory
- A field matrix labeled **required now**, **ask later**, and **optional**
- Artist and venue wireflows
- Draft, autosave, recovery, tooltip, and validation requirements
- Recommendations specific to Artists Are Jerks

## Figma and implementation sequence

Use the existing Artists Are Jerks Figma file as the visual source of truth. Add a dedicated page for the community expansion after the onboarding research and low-fidelity flows are complete.

High-fidelity screens should eventually cover:

- Regional and city Showing Now
- Permanent artist page
- Artist onboarding and first artwork upload
- Artwork management
- Exhibition and venue assignment
- Venue invitation and intake
- Artist contact management and campaign creation

Use the Astro implementation as the behavioral source of truth for real data quantities, responsive behavior, date logic, filtering, and uploads.

## Open decisions

- Exact Rogue Valley and city URL structure
- Public eligibility language for artists and artwork
- Whether an artist-controlled offline page also suppresses active exhibitions
- Artist-page contact-form behavior and abuse protection
- Sensitive-content warnings and review policy
- Report handling and moderator workflow
- Inactivity reminder cadence and possible follow-up actions
- Minimum artwork information required before public publication
- Initial email volume and deliverability limits
- When batch upload and social publishing enter the roadmap
- Future governance and succession structure

## Pilot content needed

An initial fixture is available at `src/data/community-pilot.json`. It contains Alan Just, the fictional artist Lana Yost, the fictional Medford venue Leo's Brewpub and Grill, one current exhibition, one upcoming exhibition, and varied artwork visibility and sales states. Pilot images live under `public/images/community-pilot/`.

Before high-fidelity design, prepare a realistic pilot set:

- Three representative artists
- Six to ten artworks per artist
- Two or three Rogue Valley venues
- One current exhibition
- One upcoming exhibition
- One artist who is not currently showing
- Examples of available, sold, not-for-sale, private-price, and archived works

Realistic examples will reveal information hierarchy and edge cases that generic placeholder content will conceal.


## Venue participation and recruitment — September 17, 2026

Venues may apply independently, including before a showing exists. Administrator approval unlocks venue management and recruitment tools. An approved, visible venue may appear as available to host artists before its first showing.

Venues manage their own public details: description, visitor address, city, website, public phone, hours, accessibility, visitor instructions, and hosting opportunities. Their administrator contact name/email remain private. Administrators may decline applications or remove venue visibility at their discretion.

Venues can maintain a private list selected only from approved AAJ artist members. Adding an artist to this list never creates a public showing. Artists initiate all dated showings and choose the artwork; venue confirmation is not required.

Approved venues can prepare hosting-opportunity announcements for members who opt into those emails, and invitations to outside artists to explore AAJ and apply. Invitations do not create accounts or approve membership. Outside artists become selectable only after administrator approval. Each campaign has a preview and deliberate send action.

Local implementation lives at `/prototype/venues/workspace/`, `/prototype/admin/venues/`, and `/prototype/venues/`. Approval, subscriptions, and sends are explicitly simulated using browser storage; real authentication, administrator authorization, opt-in preferences, email delivery, and the artist application page remain future implementation work.


## Shared join prototype — September 17, 2026

`/join/` provides artist and venue paths from Showing Now. Artists request consideration using a short form without account creation or artwork upload. Approval precedes a simulated invitation and acceptance; accepted artists become selectable in venue member lists, without automatic public pages or showings. Venue opportunity email preferences are opt-in. Venues use the existing intake and administrator review flow. Clerk, authenticated approval, email delivery, and individual new-artist workspaces remain deferred.


## Newly approved artist first visit — September 17, 2026

Invitation acceptance now links to `/prototype/onboarding/artist/?artist=<application-id>`. Setup carries over the applicant’s name, city, media, portfolio, and private email. Artists save a bio, independently select public website/email/phone visibility (all off initially), upload JPEG/PNG/WebP files up to 10 MB, and save multiple works with availability and public/private artwork choices. Original image files live in browser IndexedDB; profile and artwork metadata live in localStorage. A labeled sample image is available for demonstrations.

Public previews use `/prototype/artists/member/?artist=<application-id>`. Explicit publication requires at least one public artwork and adds the artist to Our Artists. The artist can take the page offline without deleting their data. Public pages have enlarged-artwork overlays with edge navigation and arrows visible only with a fine-pointer hover. New member pages do not enter Showing Now automatically. Clerk and server-enforced privacy remain deferred; query-based private previews are demonstrative, not authenticated.


## New-member showings — September 17, 2026

New artist setup links to `/prototype/onboarding/showing/?artist=<application-id>`. This reuses the dated-showing form with that artist’s saved public artwork and image files. Artists choose an approved existing venue or enter a new place, select the pieces physically displayed, and choose one featured artwork. Draft/preview/publication and listing management remain browser-local. Public showings appear in the community directory, artist page, and venue page; upcoming dates move into Artists to Come, and expired dates are hidden. An offline artist page or private featured artwork suppresses public showings without deleting the records.

### Consistent member workspace · September 17, 2026

Newly approved artists now open `/prototype/workspace/member/?artist=…`, with Home, Profile (including public contact preferences), Artwork, Showing, and Visibility. The guided profile/contact/artwork/preview sequence remains available through “Walk me through setup” inside Home. Existing browser-local member data, artwork blobs, and showings are reused. Workspaces hub and accepted invitations link to this route. Alan’s populated demonstration retains its existing route. Real access enforcement and shared storage remain deferred.

### Shared local storage · September 17, 2026

A separate local Cloudflare Worker now uses D1 for versioned entity records and R2 for artwork images. The Astro site proxies `/api/community` to loopback port 8787. `/prototype/storage/` provides non-overwriting migration, record backups, and browser connection. Safari’s Frank Stella profile, accepted application, three artwork images, venue record and one published Upcoming showing were copied through the UI; the Codex browser connected and verified the same three artworks and Frank’s place showing (September 28–October 17). Original browser records and IndexedDB images are preserved. Refresh pages to load changes from another browser. Writes use optimistic revisions; conflict recovery preserves unsynced edits in backups. No remote deployment or Clerk implementation yet. Restart instructions and limitations are in `community-api/README.md`.
