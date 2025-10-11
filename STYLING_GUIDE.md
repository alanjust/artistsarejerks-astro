# Styling Guide - Artists Are Jerks

## Your CSS Architecture

Your site now has a **designer-friendly CSS system** that gives you maximum control without the constraints of frameworks like Tailwind.

### The Three Core Files

1. **`src/styles/tokens.css`** - Your design system
2. **`src/styles/base.css`** - Global typography and resets
3. **`src/styles/utilities.css`** - Your custom utility classes

They load in this order in `BaseLayout.astro`, so tokens are available everywhere.

---

## How to Use This System

### When Vibe Coding: Talk Naturally

Instead of: *"Add a div with class bg-blue-500 p-4 rounded-lg"*

Say this: *"Add a card with purple background and 2rem padding"*

I'll understand you want:
```css
.my-card {
  background: var(--color-purple);
  padding: var(--space-8);
  border-radius: var(--radius-base);
}
```

### Your Design Tokens (Variables)

All your brand values are in `tokens.css`. Use them anywhere:

#### Colors

You have **26 colors** available! Here are the most commonly used:

```css
/* Your brand colors (use these most) */
background: var(--color-purple);     /* #7205aa - headers */
color: var(--color-gold);            /* #f9b749 - titles */
border-color: var(--color-green);    /* #75c83c - nav */

/* Art History Wheel colors (for wheel features) */
background: var(--art-wheel-blue);   /* #38a7f7 */
color: var(--art-wheel-pink);        /* #ff7be9 */
border: 3px solid var(--art-wheel-red); /* #ff2130 */

/* Global palette favorites */
background: var(--color-crimson);    /* #ff0073 - bright accent */
color: var(--color-sage);            /* #85c5a5 - calming */
background: var(--color-teal-blue);  /* #008eb6 - professional */
color: var(--color-mustard);         /* #ddb649 - warm */

/* Semantic names work too */
background: var(--color-header);     /* Same as purple */
color: var(--color-title);           /* Same as gold */
```

**See all 26 colors:** Check `COLOR_REFERENCE.md` for the complete catalog!

#### Spacing
```css
/* Use your spacing scale */
padding: var(--space-4);       /* 16px */
margin-top: var(--space-8);    /* 32px */
gap: var(--space-6);           /* 24px */

/* Semantic spacing for consistency */
padding: var(--space-section);    /* 64px - for major sections */
margin-bottom: var(--space-component);  /* 32px - between components */
```

#### Typography
```css
/* Font families */
font-family: var(--font-display);   /* Spicy Rice - for big titles */
font-family: var(--font-heading);   /* Averia Sans Libre - headings */
font-family: var(--font-body);      /* System fonts - body text */

/* Font sizes */
font-size: var(--font-size-3xl);    /* 30px */
font-size: var(--font-size-base);   /* 16px */
```

#### Other Design Tokens
```css
/* Shadows */
box-shadow: var(--shadow-base);     /* Subtle card shadow */
box-shadow: var(--shadow-lg);       /* Dramatic shadow */

/* Border radius */
border-radius: var(--radius-base);  /* 8px */
border-radius: var(--radius-full);  /* Fully rounded */

/* Transitions */
transition: var(--transition-base);       /* Smooth all properties */
transition: var(--transition-colors);     /* Just color changes */
transition: var(--transition-transform);  /* Just transforms */
```

---

## Component Styling Workflow

### Option 1: Scoped Styles (Your Sweet Spot)

**Best for:** Custom layouts, unique designs, pixel-perfect control

```astro
---
// Component logic
---

<div class="my-custom-layout">
  <h1 class="fancy-title">Artists Are Jerks</h1>
  <p class="intro-text">Welcome to the studio</p>
</div>

<style>
  .my-custom-layout {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: var(--space-8);
    padding: var(--space-section);
    background: var(--color-purple);
  }

  .fancy-title {
    font-family: var(--font-display);
    font-size: var(--font-size-5xl);
    color: var(--color-gold);
    transform: rotate(-2deg);  /* Your custom touch! */
  }

  .intro-text {
    font-family: var(--font-heading);
    color: var(--color-green);
    line-height: var(--line-height-relaxed);
  }
</style>
```

### Option 2: Utility Classes (For Quick Patterns)

**Best for:** Common patterns you repeat often

```astro
<div class="container stack-loose">
  <h1 class="text-display">Title</h1>
  <div class="card card-hover">
    <p>Content</p>
  </div>
</div>
```

Available utilities:
- **Layout:** `.container`, `.stack`, `.cluster`, `.center`
- **Cards:** `.card`, `.card-hover`
- **Grid:** `.grid-auto`, `.grid-auto-sm`, `.grid-auto-lg`
- **Text:** `.text-display`, `.text-heading`, `.text-center`
- **Scroll:** `.horizontal-scroll`, `.scroll-smooth`

### Option 3: Mix Both (Recommended!)

```astro
<div class="container">  <!-- Use utility for container -->
  <div class="hero-section">  <!-- Custom scoped style below -->
    <h1 class="text-display">My Title</h1>  <!-- Utility for font -->
  </div>
</div>

<style>
  .hero-section {
    background: linear-gradient(135deg, var(--color-purple), var(--color-orange));
    padding: var(--space-20);
    border-radius: var(--radius-xl);
    /* Your creative vision here! */
  }
</style>
```

---

## Vibe Coding Examples

### Example 1: "Create a gallery grid"

**You say:** *"Create a grid of artist cards that automatically fits the screen with 280px minimum width"*

**I create:**
```astro
<div class="artists-gallery">
  <!-- cards here -->
</div>

<style>
  .artists-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-6);
  }
</style>
```

Or use the built-in utility:
```astro
<div class="grid-auto">
  <!-- cards here -->
</div>
```

### Example 2: "Make this button pop on hover"

**You say:** *"Add a purple button that lifts up and gets a shadow when you hover"*

**I create:**
```astro
<button class="cta-button">Click Me</button>

<style>
  .cta-button {
    background: var(--color-purple);
    color: var(--color-gold);
    padding: var(--space-4) var(--space-6);
    border-radius: var(--radius-base);
    font-family: var(--font-heading);
    font-weight: var(--font-weight-bold);
    transition: transform var(--duration-base) var(--ease-out),
                box-shadow var(--duration-base) var(--ease-out);
  }

  .cta-button:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
</style>
```

### Example 3: "Center this vertically and horizontally"

**You say:** *"Center the logo in the middle of the page"*

**Quick way:**
```astro
<div class="center">
  <img src="/logo.svg" alt="Logo" />
</div>
```

**Custom way:**
```astro
<div class="logo-container">
  <img src="/logo.svg" alt="Logo" />
</div>

<style>
  .logo-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }
</style>
```

### Example 4: "Use art wheel colors for this section"

**You say:** *"Make a card with art wheel pink background and art wheel blue border"*

**I create:**
```astro
<div class="art-section">
  <h2>Art Movement</h2>
  <p>Content here</p>
</div>

<style>
  .art-section {
    background: var(--art-wheel-pink);
    border: 4px solid var(--art-wheel-blue);
    padding: var(--space-8);
    border-radius: var(--radius-lg);
  }
</style>
```

### Example 5: "Give it calming earth tones"

**You say:** *"Create a bio section with sage green background and forest green text"*

**I create:**
```astro
<div class="artist-bio">
  <p>Artist biography...</p>
</div>

<style>
  .artist-bio {
    background: var(--color-sage);
    color: var(--color-forest);
    padding: var(--space-6);
    border-left: 4px solid var(--color-dark-leaf);
    border-radius: var(--radius-base);
  }
</style>
```

---

## Page Scrolling Pattern

### The Default Behavior

**All pages scroll by default.** You don't need to add any special code or classes to make a new page scrollable.

The global CSS in `BaseLayout.astro` sets:
```css
html, body {
    height: auto;
    min-height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
}
```

### The Homepage Exception

**Only the homepage** has fixed height with no vertical scrolling. This is achieved by adding `bodyClass="homepage"` to the BaseLayout:

```astro
<BaseLayout title="Artists Are Jerks - Studio Entrance" bodyClass="homepage">
  <!-- Homepage content -->
</BaseLayout>
```

The CSS in `BaseLayout.astro` handles this:
```css
html.homepage,
body.homepage {
    height: 100%;
    overflow: hidden;
}
```

### Creating New Pages

When you create a new page, **just use BaseLayout normally** and it will scroll automatically:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="My New Page" bodyClass="my-new-page">
  <div class="my-page-container">
    <!-- Your content here - it will scroll automatically! -->
  </div>
</BaseLayout>

<style>
  :global(body.my-new-page) {
    background: var(--color-bkg-golden-yellow);
  }

  .my-page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
</style>
```

### Key Points

✅ **Default is scrollable** - New pages work immediately
✅ **No maintenance needed** - Don't update BaseLayout.astro for new pages
✅ **Homepage is special** - Only page with `bodyClass="homepage"` and no scroll
✅ **Simple pattern** - Common case (scrolling) is the default

---

## Responsive Design Strategy

### 🎯 Important: Screenshot Priority & Color Matching

**When working with uploaded screenshots or designs:**

If you provide a screenshot showing a specific layout, configuration, or design, that screenshot takes precedence over the guidelines in this document. The guidelines below are default patterns - your actual design vision (as shown in screenshots or mockups) always wins.

**Priority order:**
1. **Uploaded screenshots/designs** - What you show me visually
2. **Your direct instructions** - What you tell me in the current request
3. **This style guide** - Default patterns and approaches when neither of the above apply

**Color Handling from Screenshots:**

Screenshots can have color shifts, compression artifacts, and display variations. When you upload a screenshot:
- **Match to existing palette** - Map screenshot colors to the closest existing color in `tokens.css`
- **Use COLOR_REFERENCE.md** - Reference the 26 established colors rather than extracting hex values from images
- **Ask if uncertain** - If a color in the screenshot doesn't clearly match the palette, ask which token to use
- **Maintain consistency** - Stick to the design system rather than creating one-off colors

**Example:** If a screenshot shows a purple-ish background, use `var(--color-purple)` or `var(--color-eggplant)` from the existing palette rather than extracting a slightly different purple hex value from the compressed image.

---

### The Hybrid Approach: Container Queries + Media Queries

This site uses **both** container queries and media queries strategically:

- **Container queries** (@container) - For component-level responsiveness
- **Media queries** (@media) - For page-level layout changes

### Why Hybrid?

**Container queries** make components truly modular - they respond to *their container's size*, not the viewport. This means:
- Components work anywhere you drop them
- No surprises when nesting
- True component reusability

**Media queries** handle global concerns like:
- Overall page grid changes
- Typography scaling across devices
- Global navigation behavior

### Breakpoints

Your site uses these breakpoints with a **desktop-first approach**:

```css
/* Desktop base styles: 1440px+ (no query needed - this is your default) */

/* Laptop/smaller desktop */
@media (max-width: 1439px) { }
@container (max-width: 1439px) { }

/* Tablet landscape */
@media (max-width: 1023px) { }
@container (max-width: 1023px) { }

/* Tablet portrait */
@media (max-width: 767px) { }
@container (max-width: 767px) { }

/* Mobile */
@media (max-width: 639px) { }
@container (max-width: 639px) { }

/* Small mobile */
@media (max-width: 374px) { }
@container (max-width: 374px) { }
```

**Device categories (generic):**
- **Desktop**: 1440px+ (your design default)
- **Laptop**: 1024px - 1439px
- **Tablet landscape**: 768px - 1023px
- **Tablet portrait**: 640px - 767px
- **Mobile**: 375px - 639px
- **Small mobile**: 320px - 374px

### When to Use Which

#### Use Container Queries For:
- **Cards and content blocks** that might appear in different contexts
- **Navigation dropdowns** that need to adapt to their menu width
- **Interactive components** like the art wheel that should be self-contained
- **Reusable modules** (artist cards, movement cards, bio sections)

#### Use Media Queries For:
- **Page layout changes** (desktop grid → tablet stack)
- **Global typography** (scale down on smaller screens)
- **Header/footer behavior** (full menu → hamburger)
- **Overall grid systems** (multi-column → fewer columns)

### Desktop-First Philosophy

Start with your full desktop design, then adapt down for smaller screens:

```css
/* ✅ Good: Desktop first */
.element {
  padding: var(--space-8);
  font-size: var(--font-size-lg);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 1023px) {
  .element {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .element {
    padding: var(--space-4);
    font-size: var(--font-size-base);
    grid-template-columns: 1fr;
  }
}

/* ❌ Avoid: Mobile first (not your approach) */
.element {
  padding: var(--space-4);
  font-size: var(--font-size-base);
}

@media (min-width: 768px) {
  .element {
    padding: var(--space-8);
    font-size: var(--font-size-lg);
  }
}
```

### Vibe Coding Examples

#### Example 1: Responsive Card Component (Container Query)

**You say:** *"Make artist cards show 3 across on desktop, 2 on tablet, and stack on mobile"*

**I create:**
```astro
<div class="artists-gallery">
  <div class="artist-card">...</div>
  <div class="artist-card">...</div>
  <div class="artist-card">...</div>
</div>

<style>
  .artists-gallery {
    container-type: inline-size;
    display: grid;
    gap: var(--space-6);
    /* Desktop default: 3 columns */
    grid-template-columns: repeat(3, 1fr);
  }

  .artist-card {
    background: var(--color-sage);
    padding: var(--space-6);
    border-radius: var(--radius-base);
  }

  /* Container query: adapt to smaller containers */
  @container (max-width: 1023px) {
    .artists-gallery {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @container (max-width: 639px) {
    .artists-gallery {
      grid-template-columns: 1fr;
    }
  }
</style>
```

#### Example 2: Page Layout (Media Query)

**You say:** *"Make the page have a sidebar on desktop but stack on tablet and mobile"*

**I create:**
```astro
<div class="page-layout">
  <aside class="sidebar">...</aside>
  <main class="content">...</main>
</div>

<style>
  /* Desktop default: side-by-side */
  .page-layout {
    display: flex;
    flex-direction: row;
    gap: var(--space-8);
    max-width: 1400px;
    margin: 0 auto;
  }

  .sidebar {
    width: 300px;
    flex-shrink: 0;
  }

  .content {
    flex: 1;
  }

  /* Media query: stack on smaller screens */
  @media (max-width: 1023px) {
    .page-layout {
      flex-direction: column;
    }

    .sidebar {
      width: 100%;
    }
  }
</style>
```

#### Example 3: Hybrid Approach (Both!)

**You say:** *"Make a bio section with large text on desktop, with cards inside that adapt independently"*

**I create:**
```astro
<section class="bio-section">
  <div class="bio-cards">
    <div class="bio-card">...</div>
    <div class="bio-card">...</div>
  </div>
</section>

<style>
  /* Desktop default typography */
  .bio-section {
    padding: var(--space-section);
    font-size: 1.125rem;
  }

  /* Media query: reduce text size on smaller screens */
  @media (max-width: 767px) {
    .bio-section {
      padding: var(--space-6);
      font-size: 1rem;
    }
  }

  /* Container query: cards respond to their container */
  .bio-cards {
    container-type: inline-size;
    display: grid;
    gap: var(--space-6);
    grid-template-columns: repeat(2, 1fr); /* Desktop default */
  }

  @container (max-width: 639px) {
    .bio-cards {
      grid-template-columns: 1fr; /* Stack on mobile */
    }
  }
</style>
```

### Progressive Enhancement (Browser Support)

Container queries are newer. Use `@supports` for fallback:

```css
.my-component {
  /* Default desktop layout */
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

/* Fallback for browsers without container query support */
@media (max-width: 767px) {
  .my-component {
    grid-template-columns: 1fr;
  }
}

/* Modern browsers get container queries */
@supports (container-type: inline-size) {
  .my-component {
    container-type: inline-size;
  }

  @container (max-width: 767px) {
    .my-component {
      grid-template-columns: 1fr;
    }
  }
}
```

### Touch-Friendly Interactions

On touch devices (tablets and phones), interactive elements need minimum 44px hit area:

```css
.button,
.nav-link,
.clickable-card {
  /* Desktop default */
  padding: var(--space-3) var(--space-4);
  min-height: 40px;
}

/* Increase touch targets on touch devices */
@media (max-width: 1023px) {
  .button,
  .nav-link,
  .clickable-card {
    min-height: 44px;
    min-width: 44px;
    padding: var(--space-4) var(--space-6);
  }
}
```

### Quick Vibe Coding Patterns

When you say this, I'll use these patterns:

| You Say | Pattern I'll Use |
|---------|------------------|
| "Make it responsive" | Desktop default, max-width queries to adapt down |
| "Stack on mobile" | `flex-direction: row` base, `column` at tablet/mobile |
| "3 columns on desktop, 1 on mobile" | `repeat(3, 1fr)` base, `1fr` at mobile breakpoint |
| "Hide sidebar on tablet" | `display: block` base, `display: none` at tablet |
| "This component should adapt anywhere" | Container query with max-width |
| "Reduce font size on mobile" | Desktop size base, smaller at mobile breakpoint |
| "Make it touch-friendly on tablets" | Min 44px at 1023px and below |

### Testing Responsive Design

**Browser DevTools:**
1. Open DevTools (Cmd+Option+I on Mac, F12 on Windows)
2. Toggle device toolbar (Cmd+Shift+M on Mac, Ctrl+Shift+M on Windows)
3. Test at your key breakpoints

**Test these widths:**
- **1440px** - Standard desktop (your design baseline)
- **1280px** - Laptop
- **1024px** - Small laptop / large tablet landscape
- **768px** - Tablet portrait
- **640px** - Large phone landscape
- **375px** - Standard phone portrait
- **320px** - Small phone

### Remember

✅ **Desktop-first** = Start with full design, simplify down
✅ **Container queries** = Component responds to its container
✅ **Media queries** = Page responds to viewport
✅ **max-width queries** = Adapt down to smaller screens
✅ **Touch targets** = 44px minimum on tablets/phones (1023px and below)
✅ **Test at key widths** = Generic device categories, not specific brands
✅ **Use both** = Hybrid approach gives you maximum flexibility
✅ **Screenshots first** = Your uploaded designs override these guidelines
✅ **Match colors to palette** = Map screenshot colors to existing tokens

Design for the big screen, then gracefully adapt down. 🎨💻📱

---

## Adding New Patterns

As you work, you'll discover patterns you repeat. Add them!

### To `tokens.css` - Add new design values
```css
/* In :root {} */
--color-accent-new: #ff6b6b;     /* New color you're using everywhere */
--space-custom: 3.5rem;          /* Custom spacing you need */
```

### To `utilities.css` - Add new utility classes
```css
/* New pattern you use often */
.artwork-frame {
  border: var(--border-thick) solid var(--color-black);
  padding: var(--space-8);
  background: var(--color-white);
  box-shadow: var(--shadow-base);
}
```

### Component-specific - Keep in `<style>` blocks
```astro
<!-- Unique to this one component -->
<style>
  .artist-signature {
    font-family: cursive;
    transform: rotate(-5deg);
    /* This is specific to this page */
  }
</style>
```

---

## Quick Reference: Common Requests

| You Say | Use This |
|---------|----------|
| "Add spacing between items" | `gap: var(--space-4)` or `.stack` |
| "Make it purple" | `background: var(--color-purple)` |
| "Use art wheel colors" | `var(--art-wheel-blue)`, `var(--art-wheel-pink)`, etc. |
| "Make it crimson" | `background: var(--color-crimson)` |
| "Give it teal accents" | `border-color: var(--color-teal-blue)` |
| "Use earth tones" | `var(--color-sage)`, `var(--color-forest)`, `var(--color-brown-ochre)` |
| "Calming colors" | `var(--color-sage)`, `var(--art-wheel-pale-grey-blue)` |
| "Use the display font" | `font-family: var(--font-display)` |
| "Round the corners" | `border-radius: var(--radius-base)` |
| "Add a shadow" | `box-shadow: var(--shadow-base)` |
| "Smooth transition" | `transition: var(--transition-base)` |
| "Full width container" | `.container` |
| "Auto-responsive grid" | `.grid-auto` |
| "Center it" | `.center` |

**For all 26 colors**, see `COLOR_REFERENCE.md`

---

## Why This Works for You

✅ **Designer control** - You're not constrained by Tailwind's classes
✅ **Natural vibe coding** - Describe what you want, I write the CSS
✅ **Organized** - All your values in one place
✅ **Flexible** - Mix utilities and custom styles
✅ **Maintainable** - Change `--color-purple` once, updates everywhere
✅ **No fighting** - CSS works WITH your vision, not against it

---

## Remember

- **Tokens are your foundation** - Colors, spacing, fonts
- **26 colors available** - Brand colors, art wheel colors, and global palette
- **Scoped styles are your strength** - Use them for custom designs
- **Utilities are shortcuts** - Use them when they fit
- **Vibe code naturally** - Describe layouts and colors, I'll translate to CSS
- **COLOR_REFERENCE.md** - Your complete color catalog with examples

Your creativity leads, the code follows. 🎨

---

## Color Resources

- **STYLING_GUIDE.md** (this file) - How to use the CSS system
- **COLOR_REFERENCE.md** - Complete catalog of all 26 colors with hex codes, usage tips, and combinations
- **tokens.css** - The actual CSS variables (for reference)
