# Artists Are Jerks Onboarding Research

Status: initial comparative research

Date: September 16, 2026

Companion document: `ARTISTS_ARE_JERKS_COMMUNITY_BRIEF.md`

## Research question

How can Artists Are Jerks help a reluctant artist create a useful public presence, publish a first artwork, and document where it can be seen with the least practical friction?

The research concentrates on patterns from Instagram, Artwork Archive, ArtCloud, and Google Business Profile. These products solve different problems, so their patterns are inputs rather than templates.

## Main conclusion

Artists Are Jerks should separate **activation**, **first publication**, and **professional setup**.

The first session should produce one visible result: an artist accepts an invitation, chooses their permanent address, uploads one image, supplies only enough information to make it understandable, and previews or publishes the page.

Profile writing, detailed inventory, contacts, exhibitions, email, venue participation, and social publishing should arrive as contextual next steps after that success.

## Instagram patterns

### Account first, professional identity later

Instagram allows an existing personal or business account to be converted to a Creator account later. During conversion, the user chooses a category and account type; professional tools appear after the account already exists.

AAJ implication: invitation acceptance should establish the account and artist identity. Detailed professional configuration should not stand between the artist and the first artwork.

Source: [Create an Instagram creator account](https://www.facebook.com/help/instagram/2358103564437429)

### Media leads the publishing flow

Instagram's documented scheduled-post flow begins with choosing **Create**, selecting a post or Reel, selecting the media, then adding the caption and other settings. Scheduling lives under advanced settings and requires a professional account.

AAJ implication: begin artwork creation with the image. Present title, medium, status, exhibition, email, and social actions only after the artist can see the image in context.

Source: [Create and manage scheduled Instagram posts and Reels](https://www.facebook.com/help/instagram/439971288310029)

### Advanced capabilities can be gated by readiness

Instagram reserves scheduling and professional dashboards for professional accounts. This keeps the basic posting path distinct from operational tools.

AAJ implication: email campaigns, contact management, venue invitations, exports, and social publishing can live in the artist dashboard without entering the first-upload path.

### Publishing needs an explicit rights assertion

Instagram tells users to post material they created or have the right to share.

AAJ implication: the artist should make one clear rights assertion during account activation or first publication. Avoid repeating a legal checkbox on every ordinary edit unless the content or ownership changes.

Source: [Instagram copyright guidance](https://www.facebook.com/help/354736791367645/)

### Reporting needs enough context to act

Instagram asks reporters to provide links, usernames, and descriptions so reviewers can locate and assess content.

AAJ implication: the report action should automatically attach the page, artwork, artist, venue, and reporter-visible URL, then ask for a reason and optional explanation.

Source: [Instagram community guidelines](https://www.facebook.com/help/477434105621119)

## Artwork inventory patterns

### Private by default, selectively public

Artwork Archive keeps account information private by default. Artists activate a public profile and choose individual public pieces. It also lets artists preview the profile as a visitor before publication.

AAJ implication:

- Every uploaded artwork begins as a private draft.
- Artists choose which works appear publicly.
- A visitor-preview mode should be available before the artist page goes live.
- Profile visibility and artwork visibility remain separate controls.

Source: [Set up and customize an Artwork Archive public profile](https://help.artworkarchive.com/en/articles/802873-how-to-set-up-and-customize-your-artwork-archive-public-profile)

### Contact without exposing an email address

Artwork Archive offers a dedicated contact page with a form. Personal contact details stay private unless the artist chooses to display them, and the artist can turn the contact page off.

AAJ implication: offer an AAJ inquiry form as one artist-controlled contact method. The artist can independently enable public email, phone/text, an external contact page, and the AAJ form.

Source: [Artwork Archive public profile contact controls](https://help.artworkarchive.com/en/articles/802873-how-to-set-up-and-customize-your-artwork-archive-public-profile)

### Current, upcoming, and past can derive from dates

Artwork Archive's organization profiles automatically organize exhibitions as current, upcoming, and past from their dates.

AAJ implication: **Showing Now** should be a query over dated exhibition records. Expiration should not require a person to remember to unpublish a listing.

Source: [Artwork Archive public profile updates](https://help.artworkarchive.com/en/articles/16790447-public-profile-what-s-new-for-you-and-your-visitors)

### Artwork and physical location are separate but connected

Artwork Archive treats a location as a record and lets a piece be assigned to an existing location or a new location. Location history remains associated with the artwork.

AAJ implication: artists select displayed artworks inside an exhibition. The exhibition connects those works to a venue and date range; the artwork retains that history after the showing ends.

Sources: [Getting started with locations](https://help.artworkarchive.com/en/articles/798956-getting-started-with-locations), [Assign a piece to a location](https://help.artworkarchive.com/en/articles/798933-how-to-assign-a-piece-to-a-location)

### Minimal records can be enriched later

Artwork Archive requires only a name to create a contact record and explicitly allows later editing. ArtCloud says inventory fields do not all need to be completed.

AAJ implication: every record type needs a small valid core and a later enrichment path. Optional fields should not look like unfinished obligations during first use.

Sources: [Artwork Archive contacts](https://help.artworkarchive.com/en/articles/798924-getting-started-with-contacts), [ArtCloud inventory record overview](https://help.artcloud.com/knowledge/inventory-record-overview)

### Export is a product promise

Artwork Archive prominently states that artists can export artwork records, contacts, and reports.

AAJ implication: exports belong in the initial data model even if the export interface ships later. Records need stable identifiers and complete ownership boundaries from the beginning.

Source: [Artwork Archive for artists](https://app.artworkarchive.com/artists)

### Broad inventory categories can blur the mission

ArtCloud supports artwork, merchandise, jewelry, furniture, lighting, and decor in one inventory system.

AAJ implication: AAJ should avoid a generic merchandise type selector. Its invitation and approval process should make the visual-art scope clear before ingestion.

Source: [ArtCloud inventory record overview](https://help.artcloud.com/knowledge/inventory-record-overview)

## Venue and business patterns

### A place may exist before its owner participates

Google Business Profile separates adding an unclaimed place from claiming and verifying management access. Verification then permits the business to control its information.

AAJ implication: an artist can create a minimal venue reference for an exhibition without making the venue an AAJ user. The venue can later accept an invitation and manage its business details.

Source: [Add or claim a Google Business Profile](https://support.google.com/business/answer/2911778)

### Management authority should remain explicit

Google's guidance says only owners or authorized representatives should verify and manage business information.

AAJ implication:

- Artists may identify the place where their work is showing.
- Artists do not become managers of the venue account.
- A venue representative gains control of business details only after accepting an invitation.
- Venue participation never grants authority over artist-created exhibition records.
- The site administrator can hide the venue independently of either party.

Sources: [Google Business Profile verification](https://support.google.com/business/answer/7107242), [Business eligibility and ownership](https://support.google.com/business/answer/13763036)

## Recommended AAJ account states

These are product states for design and discussion, not a final database schema.

### Artist

```text
invited → active
active ↔ artist-offline
active or artist-offline → admin-hidden
admin-hidden → active or artist-offline (administrator only)
```

### Artwork

```text
draft → public
public ↔ private
draft, public, or private → archived
archived → draft or private
```

Sales presentation is a separate property:

```text
public price | contact for price | not for sale | private price
```

### Venue

```text
artist-supplied reference → invited → participating
any visible state → admin-hidden
admin-hidden → previous state (administrator only)
```

### Exhibition

```text
draft → published → expired
draft or published → cancelled
any state → admin-hidden
```

Published exhibition timing is calculated from start and end dates:

- Future start date: upcoming
- Current date within range: showing now
- Past end date: past

## Recommended first artist session

### 1. Accept invitation

Required:

- Email verification or sign-in
- Public artist name
- Permanent subdomain slug, with an automatically generated suggestion
- Confirmation that the artist owns or has permission to publish submitted images

Defer biography, portrait, social links, address, phone, contacts, and Instagram connection.

### 2. Add first artwork

Required:

- One image

Ask immediately after preview:

- Title, accepting **Untitled**
- Medium, with suggestions and free entry

Offer as **Add details**:

- Year/date
- Dimensions
- Description
- Sales presentation
- Additional images

The image saves as a private draft as soon as practical. The artist can safely leave and return.

### 3. Preview the artist page

Show the permanent address and the actual artwork in the AAJ page design. Identify incomplete enhancements without blocking publication.

### 4. Publish

Publish the artist page and first artwork together, or keep both private. After success, offer three contextual actions:

- Add another artwork
- Add where this work is showing
- Finish the artist profile

Do not present contact imports, email campaigns, venue invitations, or social connections before this success state.

## Recommended first exhibition flow

1. Start from an artwork or choose **Add a showing**.
2. Search existing venues by name and city.
3. If absent, add only venue name, city, street address, and optional website.
4. Enter start and end dates.
5. Select the artworks physically present.
6. Preview the public Showing Now entry.
7. Publish immediately under the artist's authority.
8. If venue contact information is available, send an informational invitation to participate.

The artist can add a venue without confirmation. A participating venue may correct its own business details but cannot initiate, approve, change, or remove the artist's exhibition record. The administrator can hide either record.

## Recommended venue invitation flow

The invitation should explain:

- Which artist named the venue
- What artwork or exhibition is listed
- What information is already public
- What joining allows the venue to manage
- That the venue cannot control artist artwork or showing records

Venue activation should require only:

- Representative name
- Work email or verified contact method
- Confirmation of authority to maintain the venue information
- Review of venue name, address, website, and hours

Mailing-list import and announcement tools arrive after activation.

## Field timing matrix

| Record | Required now | Ask after first success | Optional later |
|---|---|---|---|
| Artist activation | Sign-in, public name, slug, rights assertion | Biography, practice/media, city | Portrait, statement, CV, social links |
| First artwork | Image | Title, medium, visibility | Date, dimensions, description, price presentation, additional images |
| Exhibition | Venue name, city, dates, at least one artwork | Address confirmation, public description | Reception date, links, notes, installation images |
| Venue activation | Representative, authority, contact method | Name, address, website, hours | Description, logo, mailing list, announcement settings |
| Contact | Name | One usable contact method | Organization, tags, notes, history, address |

## Interface requirements for Figma

Every intake flow should visibly support:

- Automatic drafts
- Save-and-return behavior
- Visitor preview before publication
- A short primary path with optional detail sections
- Plain-language examples in fields
- Inline validation and recovery instead of disruptive alerts
- Clear public/private controls at the point they matter
- Mobile photo selection and large touch targets
- Upload and processing progress
- A visible distinction between artist-offline and administrator-hidden states
- A clear post-success next action

Tooltips should clarify unfamiliar art and publishing terms. Essential instructions should remain visible without requiring a tooltip.

## What not to copy from Instagram

- A public-first assumption: AAJ artwork starts privately.
- Engagement pressure, follower counts, or popularity ranking.
- An endless content feed as the primary experience.
- Requiring social-platform connection during onboarding.
- Treating the venue as a co-author of the artist's exhibition record.

## What to test with pilot users

Observe invited artists completing the flow without coaching. Measure:

- Time from invitation to first saved artwork
- Time to first public page
- Fields that cause hesitation
- Terms that need explanation
- Whether artists understand draft, public, private, and archived
- Whether they can correctly express price visibility
- Whether they can add a venue and dates without assistance
- Whether they understand what the venue will be told
- Whether they can take their page offline and predict the result

Three to five artists and two venues should expose the main comprehension problems before visual polish is finalized.

## Decisions still needed before high-fidelity Figma work

- Whether title and medium are technically required for publication or merely strongly prompted
- What an artist-controlled offline page does to active Showing Now entries
- The exact public contact-form forwarding and abuse controls
- Whether a venue can request correction of an artist-created association without joining
- Sensitive-content labels and default display behavior
- The first inactivity reminder cadence after six months
