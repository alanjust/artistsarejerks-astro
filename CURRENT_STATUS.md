# Artists Are Jerks: audit snapshot

Updated September 21, 2026. This is the starting point for a code and configuration audit. It distinguishes what is in Git from what was changed in the Cloudflare dashboard. The repository's `main` branch was at `7d44ec3` before this documentation commit and matched `origin/main` at the time of inspection.

## Current scope

- The private online test is served at `https://aaj-dev.alanjust.com`. `wrangler.test.jsonc` builds the Astro site as a Cloudflare Worker; `community-api/wrangler.test.jsonc` configures a separate community Worker with test D1, R2, and administrator email bindings. Local development uses separate local storage and config.
- Cloudflare Access gates the entire test hostname. The site Worker also verifies Access JWT issuer and audience. Clerk provides the AAJ account identity; D1 membership records determine administrator and workspace access. These are distinct layers.
- Signed-in people can submit artist, venue, and region applications. Administrators review them in the inbox. Artist approval requires applicant acceptance; acceptance assigns that account's artist workspace if it has no conflicting assignment. Approval and assignment do not by themselves publish the artist's page.
- An assigned artist can manage profile, artwork, showings, and visibility in the private workspace. Public projections filter private works and contact fields. A published artist may appear in Our Artists; dated published showings may appear in Showing Now. Prototype fixtures still exist in local development, and the online site labels test listings.
- New-application email alerts use Cloudflare Email Service. The administrator inbox remains the record of applications and notification delivery status.

## Dashboard configuration outside Git

On September 20, the `aaj-dev` Cloudflare Access application's attached Allow policy was changed from an explicit email list to **Include → Login Methods → One-time PIN**. The saved policy detail showed `Include Login Method One-time PIN`, and the policy remained attached to the `aaj-dev` application. This allows any person who verifies a working email through Cloudflare to pass the outer gate. There is no per-invitee Cloudflare allowlist. It does not grant a Clerk account, application approval, workspace membership, or administrator privileges. The Cloudflare policy and runtime secrets are not versioned in this repository.

Randy Wilson's earlier missing PIN was explained by the old allowlist: Cloudflare reports that it emailed a code even when a policy denies the address. Her email was briefly added to the list, then the list was replaced by the one-time-PIN rule for all verified emails. A fresh external-account login after that policy change has **not** been independently confirmed here; the next live check is for a tester to request a new PIN, receive it, complete AAJ sign-up, and submit an application.

## Current evidence and audit priorities

- On September 21, `npm run community:check`, `npm run test:community`, and `npm run build:test` passed. The integration test needed local loopback listen permission. The build reported zero Astro errors or warnings and passed the test-bundle secret scan.
- `node tests/test-site-access.mjs` passed separately. `node tests/directory-navigation.mjs` failed before reaching its assertions because its data-URL import cannot resolve a relative module specifier; it is not part of the `test:community` script. This test harness needs repair or replacement during the audit. The online build also emitted Vite externalization notices for Clerk's Node imports despite the clean Astro check.
- Earlier live testing confirmed separate administrator and applicant Clerk accounts, email notification and administrator approval, accepted invitation, assignment, and five saved images in Alan Russell Just's D1/R2-backed artist workspace. Recent code changes repaired workspace navigation, server-record bootstrapping, artist publishing, and directory rendering. The final public artist page and directory behavior after those changes still warrant a fresh browser verification with the applicant account.
- Audit the two authorization layers separately: Cloudflare's broad email gate and the app's Clerk/D1 role and ownership checks. Check public projection and image privacy, account switching and cache isolation, application/acceptance/assignment transitions, and failed email delivery handling.
- Treat `TEST_SITE_SETUP.md` as a chronological implementation log. Its early "Configuration still required" and single-email Access policy sections are historical, and `community-api/README.md` still contains local-only descriptions from before online deployment.

No new application code or Cloudflare deployment is part of this documentation commit.
