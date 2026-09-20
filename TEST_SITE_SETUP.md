# Private online test setup

Deployed September 18, 2026 at https://aaj-dev.alanjust.com. Localhost still uses the existing local D1/R2 storage.

## Deployment status

- Cloudflare Access application: `0e8b3bea-f793-416e-9041-da6c3769d701`, team `hidden-grammar.cloudflareaccess.com`.
- Test D1 database: `c910d001-5c95-4450-ae60-5dd483ad5a76`; migrations through `0006_admin_notifications.sql` applied. Alan's administrator assignment is initialized; no local records imported.
- Private R2 bucket: `aaj-artwork-test`.
- Both test Workers deployed with public Worker URLs and previews disabled. Independent gateway secret and existing Clerk development credentials uploaded as runtime secrets.
- Anonymous account, image and API requests redirect to Cloudflare Access. Signed-in workspace checks still require Alan to complete Access login.

## Prepared components

- `npm run build:test` creates a separate Cloudflare build in `dist-test`.
- `npm run test:deploy:check` validates the bundle without deploying it.
- `wrangler.test.jsonc` describes the test site and its private community service binding.
- `community-api/wrangler.test.jsonc` describes separate test D1/R2 resources. Its database ID is deliberately unfinished until the test database exists.
- Every site request, including static assets, passes a signed Cloudflare Access JWT check. Missing configuration or invalid tokens deny access.
- Public Workers addresses and preview URLs are disabled for both services.
- The test build strips local server secrets and checks for embedded Clerk keys. Secrets are runtime bindings. The community service keeps its loopback guard: the front end calls it internally through its binding with an internal request URL.
- Server files are excluded from static asset uploads.

## Configuration still required

1. Establish the Cloudflare Zero Trust team and a private test-site hostname.
2. Create an Access application for that hostname, initially allowing Alan's email only. Record the team's `https://….cloudflareaccess.com` URL and the application's audience tag.
3. Create `aaj-community-test` D1 and `aaj-artwork-test` R2; fill in only the test database ID and apply migrations with the test config.
4. Set an independent shared gateway secret on both test Workers. Set Clerk development credentials on the test-site Worker. Never copy local pending browser edits or automatically migrate demo records.
5. Set `TEST_ACCESS_TEAM` and `TEST_ACCESS_AUD` on the test-site Worker. Configure Clerk for the test hostname.
6. Deploy the internal community Worker, then the Access-protected site. Configure its custom hostname after Access exists.
7. Verify Access denial outside the allowed account and test sign-in, ownership, uploads, save conflicts, and public/private projection from desktop and phone.

This is not a production launch. Current static demo pages still contain labeled prototype fixtures. No local metadata has been imported, no real emails are enabled, and online intake remains a separate follow-up. Astro's session feature is unused; add an isolated test SESSION KV binding before introducing Astro sessions.

## Artwork upload repair — September 18

The legacy First upload form wrote only a title/visibility browser entry. It did not retain the selected image or update Alan's workspace. It now saves images through the existing shared image API and stores complete upload metadata under `alan-workspace.uploadedWorks`. Completion waits for the shared write to finish and reports failures without showing success. Workspace and artist-page previews read these records; public projection excludes private uploads, private prices, and profile contact fields. The fictional Leo's showing assignment was removed from this flow.

Validation: Astro check/build and bundle secret scan passed; D1/R2 integration checks passed for fresh-read upload persistence, visibility filtering, offline pages, and private-field exclusion. Alan subsequently uploaded Iris in Safari and confirmed that it persists in the workspace.

## Preview gallery repair — September 18

Alan confirmed Iris uploaded successfully, but it was missing from the artist preview. A narrow remote query confirmed Iris is stored with public visibility (JPEG, 3,580,643 bytes). Upload rendering previously selected the first artwork grid, which belonged to the demo exhibition. It now targets the Selected work gallery explicitly, handles either trailing-slash form of Alan's URL, and reports failed shared preview reads visibly. Alan's online test preview no longer renders the fictional exhibition; the local demo remains. Uploaded and existing gallery images use asynchronous decoding; uploads also load lazily. Scope discovery runs once per gallery rather than rescanning it for every upload.

Validation: artist preview regression with two galleries passed (correct destination, private-work exclusion, private-price exclusion, image URL); Astro check/build/secret scan and account cache checks passed. Safari scrolling briefly became unstable during the earlier client-rendered version. The server-rendered preview replaced that path, and Alan later confirmed that Iris appears after the saved state is loaded.

## Server-rendered artist preview — September 18

Alan reported Iris still absent despite saved visible status. A remote title/visibility/pageVisible query again confirmed Iris is public and the page is not explicitly offline. The artist preview now reads the existing public projection through the backend service binding on the server and renders uploads with the same ArtworkCard component as the existing gallery. It no longer relies on client JavaScript insertion to show uploads. Hidden works/prices remain filtered by the backend public projection; offline pages and failed preview reads have explicit responses. Astro check/build and secret scan passed. Alan confirmed in Safari that Iris now appears.

## Original artwork visibility — September 18

Alan confirmed Iris appears and toggles correctly but the six original works ignored their visibility settings. The public projection now includes only IDs of original works explicitly saved as private, and the server-rendered preview excludes them. If visibility storage fails, Alan's gallery is withheld with a visible error rather than displaying works whose privacy cannot be checked. Original and uploaded artwork menus now use the same Visible on artist page / Private labels. Existing stored choices are preserved. D1/R2 tests passed for original artwork private-to-visible projection changes; backend type check and Astro check/build/secret scan passed. Alan confirmed both original and uploaded artwork visibility controls in Safari.

## Directory controls — September 18

Showing Now view controls previously depended on static imports of shared-storage modules completing before listeners were registered. Navigation and filters now initialize first, with storage-dependent updates loaded asynchronously afterward. View switching also avoids smooth scrolling. A regression test holds all storage imports indefinitely and verifies Showing Now, Our Artists, and Overview still switch panels and pressed state. Astro check/build/secret scan passed. Alan confirmed the three views work in Safari.

## Workspace counts and language — September 18

The Home card now counts every work in the artist's studio, including private works, while the checklist separately counts works visible on the artist page. The supporting copy is `Manage all your artwork, visibility, and availability.` This avoids implying that the larger studio total is also the public total. Counts update from shared storage after uploads and visibility changes. Alan confirmed the visibility tab correctly takes the artist page offline and restores it.

## Showing integration — September 18

Uploaded works now join the same showing controls as the six original works. Iris appears in both the artwork checklist and representative-artwork menu for the optional Leo's demonstration and the real Create a showing form. A showing can select any subset of one artist's works, and one artist can have concurrent dated showings at several venues. Multiple artists may independently associate their work with the same venue and dates, allowing a group exhibition without giving one artist control over the others.

The public Showing Now projection reads saved, visible showings and their representative artwork. Venue and artist pages can refer to the same showing records. Demo-only fixtures remain labeled and are not presented as Alan's real plans.

## End-to-end showing verification — September 19

Alan's saved `Test Venue — Not Real.` draft was published inside the protected test site with Paul Missal Portrait, White Rabbit Contemplates Winemaking, Premium Products for Cidermaking, and Iris. The representative image is Paul Missal Portrait. The same dated showing was verified on Showing Now, Alan's artist page, and the venue page; Alan's artist page also listed all four assigned works, including Iris.

Online-test wording now says `Publish to test site`, `protected test site`, and `Published showings` instead of describing shared records as browser-local. Showing Now no longer loads the venue workspace module merely to decorate public fixtures; that circular client initialization produced a misleading directory failure notice even while the saved listing rendered correctly. Public showing rendering remains handled by the dedicated public projection and `BrowserShowings` component.

## Account workspaces and test-directory cleanup — September 19

The protected online Workspaces page is now an account portal. An artist sees only the artist workspace assigned to that account, a venue owner sees only the assigned venue workspace, and an administrator additionally sees application review and account-assignment tools. It does not list other members' private workspaces. The broad Alan, Leo's, and prototype navigation hub remains available only during local development.

Showing Now no longer includes FPO cards, Lana Yost, or the fictional Alan-at-Leo's fixture in the online-test build. Those fixtures remain in local development for layout work. The protected directory now begins with saved test-site records, so its count and filters reflect the records being tested. Alan remains in Our Artists; future approved member records can join through the shared directory projection.

## Multiple-venue acceptance test — September 19

Alan created an overlapping second showing at `Museum Test — Not Real` with Alan Just Self Portrait and My Big Sister Connie, while the existing Test Venue showing retained Paul Missal Portrait, White Rabbit Contemplates Winemaking, Premium Products for Cidermaking, and Iris. Alan verified that Showing Now reported two showings, his artist page displayed both, and each venue page contained only its assigned artwork. Editing and publishing the second showing did not disturb the first. The core one-artist/multiple-simultaneous-venues model is accepted.

## Regional direction

The product is intended to begin in the Rogue Valley and expand nationally by adding regions as demand appears. Regions should be records with stable IDs rather than hard-coded city lists. Artists and venues attach to a region; directory views filter by region. A future chapter application can collect a proposed city or area, applicant details, local context, and intended role. Approval creates or activates the region without requiring every possible national market to be defined in advance. Portland–Vancouver and Santa Fe are useful future test cases, but the first launch can remain focused on the Rogue Valley.

## Region proposal foundation — September 19

Rogue Valley is now the first active region record. A signed-in person may propose an unlisted area even when the account has no artist, venue, or administrator assignment. The proposal records the core city, state, proposed coverage, local connection, intended role, and reason the area is ready. Applicants can see only their own proposals. Administrators can review every proposal; approval creates an active region immediately without a deployment, while workspace access remains a separate decision.

Active regions populate the region choices in artist and venue onboarding. City remains free text so a newly approved area does not require another hard-coded city list. The public directory still presents the Rogue Valley view until a second real region is approved and the visitor-facing region switcher is designed.

Validation covers unassigned-account submission, applicant isolation, duplicate-pending rejection, administrator-only review, approval, and public active-region retrieval. Community API type checking, the D1/R2 integration suite, local and online builds, and bundle secret scanning pass.

## Shared application intake and administrator inbox — September 19

Artist and venue applications now use the same shared D1 service as region proposals. Each submission belongs to the signed-in account; applicants can see only their own records. The administrator Workspaces page links to one inbox that combines artist, venue, and region applications, shows pending totals, and supports approval or rejection. Artist approval is followed by applicant acceptance, while approved venues are immediately eligible for account assignment. Approval alone does not grant administrator privileges or assign a workspace.

Every submission also creates an administrator-notification record. The inbox remains the authoritative alert channel if email delivery ever fails. Transactional alerts are active through Cloudflare Email Service using the isolated `aaj-mail.alanjust.com` sending subdomain. The Worker binding is restricted to `applications@aaj-mail.alanjust.com`; the administrator recipient is stored as a Worker secret. A direct activation message was accepted by Cloudflare for delivery to the administrator address.

Live verification confirmed that the unified inbox preserves and displays the existing Santa Fe proposal, that the approved region appears alongside Rogue Valley in the venue application menu, and that the signed-in venue intake page loads with no existing venue applications for Alan's account.

Application ownership follows the Clerk account that is signed in when the form is submitted. The private contact email is correspondence information; entering a different address does not create or switch accounts. The administrator inbox withholds workspace assignment until an approved artist accepts the invitation, and it warns when that applicant account already owns a different artist workspace.

## Account identity checkpoint — September 19

Alan's current Clerk user has two roles: administrator and artist. That single account owns one artist workspace, `artist-alan-just` (Alan Just). Administrator access is a permission on the account; it is not another workspace.

The Alan Russell Just test submission demonstrated that an application's private contact address does not determine account ownership. It was attached to Alan's existing Clerk user, approved, accepted, and deliberately never assigned because assignment would have replaced `artist-alan-just`. Alan requested a clean restart, so the test application and its matching administrator-notification record were permanently deleted from the private test database on September 19. It is no longer an active application, account, or workspace. The Santa Fe region proposal remains.

Private account and workspace screens now show a labeled identity panel with the current Clerk name and sign-in email, assigned roles, artist workspace, and an explicit `Sign out of AAJ` control. Signing out of AAJ/Clerk is separate from the outer Cloudflare Access login.

## Artist acceptance and workspace assignment — September 20

Alan completed a clean two-account test: `alan@alanjust.com` remains the administrator and Alan Just artist account, while `alanjust@gmail.com` is a separate Clerk applicant account for Alan Russell Just. The application notification email arrived, the administrator approved the application, and the Gmail applicant accepted the invitation.

The original flow then required the administrator to return and assign the workspace manually, leaving the accepted applicant on a page with no useful next action. Approved artist acceptance now automatically assigns that application as the account's artist workspace when the account has no other artist workspace. The acceptance page says `Your artist workspace is ready` and links directly to it. Accounts that already own a different artist workspace are rejected instead of silently replacing the assignment.

## Second-artist workspace handoff — September 20

Alan Russell Just's assigned workspace and five uploaded JPEGs were confirmed in shared D1/R2 storage. Opening the workspace still showed an invitation warning because the client required an accepted application in an older browser cache before it would read the durable artist record. The workspace now treats its saved artist record as authoritative after the protected server route verifies ownership. The five saved works remain intact and appear under Artwork.

The workspace adds a direct return link to Your Workspaces, keeps Home, Profile, Artwork, Showings, and Visibility available as persistent tabs, and shows the artwork count on the Home action. The account identity panel displays the application name instead of a raw workspace UUID when Clerk has no profile name. Online copy identifies private test storage rather than a local prototype.

Validation includes a regression proving that a saved assigned artist loads without a browser-local application copy, the D1/R2 integration suite, API type checking, the online test build, and the bundle secret scan.

## Confirmed product behavior

- Artist and venue data persist in the private online test site.
- Iris uploads, appears in Alan's workspace and artist preview, and obeys its visibility setting.
- Original works and uploaded works share the same `Visible on artist page` / `Private` language and behavior.
- The whole artist page can be taken offline and restored.
- Showing Now, Our Artists, and Overview navigation works.
- An artist may divide different works among several simultaneous venues.
- A venue may show several artists during the same dates; each artist manages their own participation.

## Next checkpoint

Verify the repaired Alan Russell Just workspace in Safari: Home should report five artworks, Artwork should display all five images, and the account panel should name Alan Russell Just. A visitor-facing region switcher is needed only when a second real community is ready to publish.
