# Artists Are Jerks

## Project state

Artists Are Jerks is an Astro site about visual art, artists, creative practice, and the systems around them.

The former Art Lab and Hidden Grammar application is archived at the `art-lab-final-2026` tag and the `archive/art-lab-legacy` branch. Do not restore or reuse its database structure for new site features.

The community system now has a deliberately separate data model and a private Cloudflare test deployment. It includes artist accounts and workspaces, artwork uploads and visibility, venue intake and workspaces, dated multi-venue showings, and public directory projections. The current implementation is still a protected prototype; it is not the production launch.

## Before implementation

Read:

- `STYLING_GUIDE.md`
- `COLOR_REFERENCE.md`
- `ARTISTS_ARE_JERKS_COMMUNITY_BRIEF.md` for the product model and boundaries
- `TEST_SITE_SETUP.md` for the current implementation, deployment, validation, and next steps
- `ONLINE_TEST_SITE_PLAN.md` for the protected test-site architecture
- `DOMAIN_AND_EMAIL.md` before touching DNS, email, or signing up for any service; project accounts belong to `admin@artistsarejerks.com`, not Alan's personal accounts
- `LEGACY_ART_LAB.md` when work concerns the retired application

## Design and code conventions

- Framework: Astro
- Styling: custom CSS with design tokens, no Tailwind
- Fonts: Spicy Rice for display and Averia Sans Libre for headings
- Design tokens: `src/styles/tokens.css`
- Base styles: `src/styles/base.css`
- Utilities: `src/styles/utilities.css`
- Shared layout: `src/layouts/BaseLayout.astro`
- Prefer scoped component styles and existing design tokens.
- Use mobile-first responsive design: style for phones first, then add layout for wider screens with min-width queries. Retain 44px minimum touch targets.
- Keep the community system's D1/R2 model separate from the archived Art Lab schema.
- Do not treat prototype fixtures, demo showings, or the protected test site as production data.
- Preserve server-side public projections: private artwork, private prices, private contact details, and offline artist pages must stay out of public responses.

## Public voice

Use the guidance in `agent_docs/voice-ira-glass.md` unless Alan requests a different voice.

## Typography

Do not put spaces around em dashes.

## Session greeting

At the start of the first reply in each session, greet Alan as "Mr. Fuzzface" and list the full paths of the `CLAUDE.md` files loaded for the session.
