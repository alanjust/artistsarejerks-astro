# Artists Are Jerks

## Project state

Artists Are Jerks is an Astro site about visual art, artists, creative practice, and the systems around them.

The former Art Lab and Hidden Grammar application is archived at the `art-lab-final-2026` tag and the `archive/art-lab-legacy` branch. Do not restore or reuse its database structure for new site features. The future community-market system will use a new data model.

## Before implementation

Read:

- `STYLING_GUIDE.md`
- `COLOR_REFERENCE.md`
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
- Use desktop-first responsive design and retain 44px minimum touch targets at tablet and phone sizes.
- Do not introduce a database or server-rendered architecture until the community-market data model is deliberately designed.

## Public voice

Use the guidance in `agent_docs/voice-ira-glass.md` unless Alan requests a different voice.

## Typography

Do not put spaces around em dashes.

## Session greeting

At the start of the first reply in each session, greet Alan as "Mr. Fuzzface" and list the full paths of the `CLAUDE.md` files loaded for the session.
