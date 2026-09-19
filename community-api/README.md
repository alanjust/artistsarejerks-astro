# Shared community storage (local prototype)

The static Astro site stays intact. A separate loopback Worker serves versioned
community records through D1 and uploaded image blobs through R2. An authenticated Astro server route exposes `/api/community` on the existing site origin.

## Restart local development

From the repository, in separate terminals:

```
npm run community:migrate
npm run community:dev
npm run dev -- --port 4323
```

The schema migration is idempotent. Wrangler persists D1/R2 state beneath
`community-api/.wrangler/state`. Do not delete that directory if you need the
migrated community data. These commands do not access remote Cloudflare storage.

Visit `http://127.0.0.1:4323/prototype/storage/` in the browser with source data.
Use “Copy this browser’s data & connect” once. Other browsers use “Connect to
shared storage.” Each source browser retains an original record snapshot under
`aaj-storage-backup-*` and its original IndexedDB images. A record backup download
contains metadata, not the image files. Refresh older tabs after connecting.

Safari's Frank Stella sample was migrated through the UI on September 17. Its
three images, accepted application, artist profile, venue information and dated
showing are shared with the Codex browser. Its original browser state is retained.

## Save behavior

Pages hydrate their cache from D1 before their controllers initialize. Existing
synchronous controllers queue record changes; a banner reports pending or failed
saves. Navigating with pending writes triggers a browser prompt. Failed edits are
retained under `aaj-shared-storage-pending`. Revisions are captured when edits are
queued, and stale writes fail with 409 rather than overwriting another browser.
Deletions are versioned tombstones. On a conflict, Storage & migration can back up
unsynced edits and reload the shared version. Refresh to see another browser's
new changes; live form merging is not implemented.

Images are written to R2 before their artwork metadata is saved. JPEG/PNG/WebP
uploads have bounded size and signature validation. Image URLs use the local API.
Removed artwork images are retained for now; authenticated retention/cleanup is
future work. Records use a JSON payload per entity to preserve the current model;
relational artist/artwork/venue/showing tables and indexes can follow alongside
server-side ownership and domain validation.

## Checks

```
npm run community:check
npm run test:community
npm run build
```

Integration tests use an isolated Cloudflare runtime, never the migrated database.
They exercise revisions, stale edits, tombstones, image round trips, and request
origin guards.

## Deployment boundary

This is **not a public backend**. No remote D1 database or R2 bucket was created.
The placeholder database ID is local only. The API rejects non-loopback hostnames
and cross-site requests and requires a custom header for writes. Clerk sessions are verified by the Astro gateway. The Worker requires a short-lived HMAC capability bound to identity, method, path, and body; direct unsigned requests fail. Ownership filters cover artist records and showings. Venue writes and private image blobs remain administrator-only. Before remote provisioning/deployment, complete persisted member assignment, validated venue operations, public-only
read projections, image ownership and stricter domain validation. Do not remove
the hostname guard until those controls exist.

Alan's fixture galleries remain static sample data. His workspace and selected
featured image are synchronized if saved/imported. The legacy artwork-analysis
upload demo remains a separate demonstration, outside this migration.

## Authenticated local API

The browser calls the Astro route at /api/community. That route verifies the Clerk session and looks up its explicit server-side assignment, then signs a 30-second capability. The Worker checks the signature and request body before accessing D1 or R2. Signed-out requests return 401; unassigned accounts return 403. Writes require a same-origin browser request. Revisions continue to guard against stale edits.

COMMUNITY_GATEWAY_SECRET must match in the ignored root .env and community-api/.dev.vars files. Restart both local services after changing it. Never use a PUBLIC_ prefix or put the secret in committed config. A production build requires that server-only setting in its runtime/build environment.

Alan is the only assigned development account and is an administrator. Ordinary artist policy is exercised with isolated test identities. Venue intake changes and image blobs remain restricted to administrators until validated owner operations are ready. Public visitor data, anonymous intake submission, per-user browser cache isolation, and persistent approval-to-account assignment still need separate endpoints before online testing. The static directory fixtures remain viewable; shared dynamic data currently requires assigned sign-in.

## Public reads and membership authority

GET /api/community/public/state returns a whitelist-based public projection; GET /api/community/public/images/:key returns a blob only when a published approved artist has a public work using it. These endpoints do not require login and still enforce the local hostname guard. All other endpoints retain signed gateway authentication. Public browser pages keep their projected records in memory without changing private caches.

Migration 0002 creates community_memberships, which is the authoritative role and ownership mapping. Clerk verifies identity; membership checks are performed from D1 for every private Worker request. The /access endpoint supplies that mapping to Astro page checks. It is not exposed publicly. Signed role assertions do not override D1.

Only administrator image uploads are currently enabled. Artist writes cannot introduce a new private image reference until per-image ownership is implemented. An administrator assignment UI, secure intake/account binding, owner image uploads, venue owner mutations, and private per-user cache isolation remain next.
