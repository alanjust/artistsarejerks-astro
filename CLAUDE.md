# Artists Are Jerks - Astro Site

## Critical: Always Review Documentation First

**Before implementing any code, review:**
- **STYLING_GUIDE.md** - Responsive design strategy, design tokens, CSS patterns
- **COLOR_REFERENCE.md** - 26-color palette reference

## Screenshot & Design Priority

1. **Uploaded screenshots** - Follow exactly as shown
2. **Direct instructions** - User's current request
3. **Documentation** - Default patterns in guides

**Color handling:**
- Map screenshot colors to closest existing token in `COLOR_REFERENCE.md`
- Never extract hex values from screenshots (compression artifacts)
- Ask if color match is uncertain

## Responsive Design Approach

**Desktop-first** (1440px baseline):
- Base styles for desktop, use `max-width` queries to adapt down
- Hybrid: Container queries for components, media queries for layouts
- Generic breakpoints: 1440px, 1024px, 768px, 640px, 375px, 320px

## Project Info

**Framework:** Astro
**Styling:** Custom CSS with design tokens (NO Tailwind)
**Fonts:** Spicy Rice (display), Averia Sans Libre (headings/body)
**Design System:** `src/styles/tokens.css`

**Key Files:**
- Design tokens: `src/styles/tokens.css`
- Base styles: `src/styles/base.css`
- Utilities: `src/styles/utilities.css`
- Layout: `src/layouts/BaseLayout.astro`

## Coding Standards

- Desktop-first responsive design
- Use design tokens (`var(--color-purple)`) never hardcode values
- Scoped component styles preferred over utilities
- All pages scroll by default (except homepage with `bodyClass="homepage"`)
- Touch targets: 44px minimum on tablets/phones (1023px and below)

## Build Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
