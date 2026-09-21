# Artists Are Jerks

An Astro site about visual art, artists, creative practice, and the systems around them.

For the latest implementation and online-test status before an audit, read [CURRENT_STATUS.md](CURRENT_STATUS.md). Earlier setup notes in [TEST_SITE_SETUP.md](TEST_SITE_SETUP.md) and [community-api/README.md](community-api/README.md) include historical checkpoints.

The former Art Lab and Hidden Grammar application was retired from the active site in September 2026. Its complete final implementation, including the database migrations and Cloudflare bindings, is preserved at:

- Tag: `art-lab-final-2026`
- Branch: `archive/art-lab-legacy`

See `LEGACY_ART_LAB.md` for the archive boundary and restoration notes.

## Development

```bash
npm install
npm run dev
```

The local server uses port `4326`.

## Build

```bash
npm run build
```

The site builds as static HTML into `dist/` and can be deployed to Cloudflare Pages.
