# Private online testing plan

## Information to preserve

Alan Just’s artist profile and original artwork are the only current content intended for future use. Keep the original artwork files independently backed up. Alan has no confirmed physical exhibition: his artist page can be public and listed in Our Artists while Showing Now has no Alan entry.

Leo’s Brewpub and Grill, Lana Yost, Frank Stella’s test account, and dated exhibition examples are demonstration content. Retain them locally for workflow testing. Do not automatically import them into the future live community. Existing local records have not been deleted.

## Testing environment

Create a separate Cloudflare test site, D1 database, and R2 bucket. Keep localhost independent; do not add automatic two-way database synchronization. Transfer only selected records and images deliberately. Real production storage will be separate again.

The current Astro site is static and its API proxy only runs during local development. Hosting its build alone would not provide a working community API. The online environment must route the API alongside the site and replace localhost-only client connection behavior.

## Access before deployment

Set up a Clerk development application and sign-in flow. Validate sessions on the server. Associate each approved artist and venue with the signed-in Clerk user, and keep administrator roles under server control. Enforce these permissions on every API read and write, including image access. Public directory endpoints must return only permitted public fields, never complete private applications or contacts.

For the first online trial, protect the whole test environment with Cloudflare Access as well. Use a small list of testers. This outer gate supplements application permissions; it does not replace artist and venue ownership checks.

Replace the local API’s generic collection writes with server-validated operations. Retain version checks so stale edits do not overwrite newer records. Preserve the current loopback restriction until the authenticated online API is ready.

## Before sharing the test URL

Verify anonymous requests cannot access workspaces or private API data; an artist cannot edit another artist; a venue cannot edit another venue or initiate an artist’s showing; only administrators can approve applications. Check public visibility, image access, date boundaries, and saving from two browsers. Confirm no real invitation or campaign emails are enabled.

Import Alan’s chosen public information without a fictional showing. Keep optional demo fixtures clearly labeled and separate from content intended for launch. Test on phone and desktop, then invite a small group to evaluate language and workflow.

## Current status

Local shared storage is implemented. No online test database, bucket, or deployment has been created. Clerk development application is linked. Sign-in, sign-up, and the protected account page are installed using on-demand Astro routes with a local Node adapter. Alan’s workspace, artist and venue administrator review pages, and storage settings now use server-side Clerk access checks. Alan’s verified development user is explicitly assigned to the existing artist profile and administrator role in src/lib/community-access.ts. Other prototype routes and the local community Worker are not yet protected by Clerk. Server ownership, roles, and public-only API projections remain required before deployment. A future Cloudflare deployment needs a Cloudflare-compatible server adapter and API routing; do not upload this build as a purely static site.

## Workspace cleanup and interim restrictions

Alan’s workspace no longer labels the fictional Leo’s exhibition as a confirmed current showing. It is retained inside an optional demonstration section. Artwork and saved metadata are preserved. The storage message describes the shared local save banner.

Unfinished member, onboarding, and venue editing routes now require the development administrator. This is an interim restriction for local evaluation, not multi-member ownership. The community Worker still has no Clerk session checks; do not deploy or remove its loopback hostname guard. Next, introduce persisted ownership assignments, authenticated API operations, and public-only read projections, then replace these administrator-only route restrictions with the proper owner checks.

## Storage API authentication added

The Vite bypass proxy has been removed. The Astro API gateway verifies Clerk identity and server-side assignment, then signs requests to the local Worker. The Worker rejects unsigned/tampered requests and applies owner filters for artist profiles and showings. Venue writes, applications/approvals, featured overrides, and private image access remain administrator-only. Alan’s signed-in Safari workspace has been verified to load shared records.

Before online deployment, finish persistent membership assignment, validated venue-owner operations, public-only directory and image reads, anonymous intake endpoints, and per-user browser-cache isolation. These are not provided by the current local gateway. No online storage or site has been created.

## Public reads and persisted access

Published approved artist profiles and public works now have a separate whitelist-based public API. Private contacts require explicit visibility flags; private prices, application notes, campaign recipients, and non-public works are omitted. Public images require a currently published public work reference. Public pages use an in-memory public cache rather than reading private workspace localStorage.

The community_memberships D1 table now owns account-to-artist/venue and administrator assignments. Migration 0002 preserves Alan’s existing Clerk account assignment. The Worker derives permissions from this table, never the caller’s asserted role. The Astro page helper reads that assignment through the signed gateway.

Remaining: administrator assignment UI and approval-to-account binding, validated venue owner writes, image owner metadata/uploads, private browser-cache isolation between signed-in accounts, anonymous intake endpoints, and the Cloudflare online environment. Local services remain the only deployment.


Account assignments are now available at `/prototype/admin/accounts/`. The administrator enters a Clerk user ID; the Astro gateway verifies that user in this application's Clerk instance before the local database saves the assignment. Artist assignments require approved, accepted applications (Alan's existing profile is retained); venue assignments require approval. Unique database indexes enforce one account owner per artist/venue, and administrators cannot remove their own administrator access through this endpoint. Member and venue editing still remain restricted pending ownership-safe client caches and image ownership. No remote deployment or synchronization was performed.


Assigned member editing is now enabled for the artist setup, member workspace, and showing form. Artist uploads have D1 ownership metadata seeded from existing artwork references; private retrieval and publication of new image references require ownership. Venue owners can edit assigned, approved venue details while status, visibility, artist lists, and campaigns remain protected. Private workspace caches verify the current user before loading and preserve previous-account edits in a local backup without replaying them. Offline artist previews use authenticated owner-filtered records. No remote resources were changed. Anonymous intake, remaining legacy prototype routes, online environment configuration, and online deployment still require review.


A separate Astro 5 Cloudflare test build and private service-binding transport are prepared. The test site validates signed Cloudflare Access tokens before serving any requests and denies access when the Access team/audience is missing. Worker public/preview routes are disabled. Test configuration and provisioning steps are in TEST_SITE_SETUP.md. The database ID is not configured and no cloud resources or deployments have been created. Both local and Cloudflare build checks are required; the test bundle passes Wrangler's deployment dry run.
