# Color Reference - Artists Are Jerks

Quick reference for all available colors in your design system.

## 🎨 Your Brand Colors (Keep Using These!)

These are your core identity - use them for consistent branding:

```css
--color-purple      #7205aa   /* Header background */
--color-gold        #f9b749   /* Title text, accents */
--color-green       #75c83c   /* Navigation links */
--color-orange      #F5A623   /* Stage/background */
--color-black       #000000   /* Footer, borders */
```

**Semantic aliases (easier to remember):**
- `--color-header` → purple
- `--color-title` → gold
- `--color-nav` → green
- `--color-stage` → orange
- `--color-footer` → black

---

## 🎡 Art History Wheel Colors

Use these for the art wheel feature and related content:

| Color | Hex | Variable |
|-------|-----|----------|
| Blue | #38a7f7 | `--art-wheel-blue` |
| Pink | #ff7be9 | `--art-wheel-pink` |
| Red | #ff2130 | `--art-wheel-red` |
| Orange | #ffa23d | `--art-wheel-orange` |
| Green | #75c83c | `--art-wheel-green` |
| Pale Grey Blue | #bdccd4 | `--art-wheel-pale-grey-blue` |

**Note:** Art wheel green is the same as your brand nav green!

---

## 🌈 Global Color Palette

Your full extended palette for creative variety:

### Purple Family

| Color | Hex | Variable | When to Use |
|-------|-----|----------|-------------|
| Violet | #7205aa | `--color-violet` | Headers, emphasis (same as brand purple) |
| Eggplant | #b152f2 | `--color-eggplant` | Lighter purple accents |
| Plum Red | #af0048 | `--color-plum-red` | Deep dramatic accents |
| Crimson | #ff0073 | `--color-crimson` | Bright pink-red highlights |

### Orange/Yellow Family

| Color | Hex | Variable | When to Use |
|-------|-----|----------|-------------|
| Red Orange | #ff4800 | `--color-red-orange` | Hot, energetic accents |
| Burnt Orange | #e05f01 | `--color-burnt-orange` | Warm, earthy tones |
| Bkg Golden Yellow | #f9b749 | `--color-bkg-golden-yellow` | Titles, highlights (same as brand gold) |
| Mustard | #ddb649 | `--color-mustard` | Muted yellow |
| Peach | #ffca9c | `--color-peach` | Soft, warm backgrounds |
| Brown Ochre | #b15902 | `--color-brown-ochre` | Earth tones, grounding |

### Green/Blue Family

| Color | Hex | Variable | When to Use |
|-------|-----|----------|-------------|
| Olive Green | #65a111 | `--color-olive-green` | Natural, organic feel |
| Forest | #318e16 | `--color-forest` | Deep green accents |
| Dark Leaf | #02723a | `--color-dark-leaf` | Dark green, serious tone |
| Sage | #85c5a5 | `--color-sage` | Soft, calming green |
| Aqua Green | #0ba59b | `--color-aqua-green` | Fresh, vibrant teal |
| Sea Green | #008b79 | `--color-sea-green` | Deep teal |
| Deep Teal | #006382 | `--color-deep-teal` | Ocean blue-green |
| Teal Blue | #008eb6 | `--color-teal-blue` | Bright blue-green |
| Navy | #004999 | `--color-navy` | Dark blue, professional |
| Black Green | #104100 | `--color-black-green` | Very dark green, mysterious |

---

## 💡 Vibe Coding Examples

### Using Brand Colors
```css
.header {
  background: var(--color-purple);
  color: var(--color-gold);
}

/* Or use semantic names */
.header {
  background: var(--color-header);
  color: var(--color-title);
}
```

### Using Art Wheel Colors
```css
.movement-card {
  background: var(--art-wheel-blue);
  border: 3px solid var(--art-wheel-pink);
}
```

### Using Global Palette
```css
.artist-bio {
  background: var(--color-sage);
  border-left: 4px solid var(--color-forest);
}

.cta-button {
  background: var(--color-crimson);
  color: var(--color-white);
}

.info-panel {
  background: var(--color-peach);
  color: var(--color-brown-ochre);
}
```

---

## 🗣️ How to Request Colors When Vibe Coding

### Natural Ways to Ask:

✅ **"Make it crimson with white text"**
```css
background: var(--color-crimson);
color: var(--color-white);
```

✅ **"Use that art wheel pink for the background"**
```css
background: var(--art-wheel-pink);
```

✅ **"Give it a sage green background with forest green borders"**
```css
background: var(--color-sage);
border: 2px solid var(--color-forest);
```

✅ **"Make this section teal-blue with navy accents"**
```css
background: var(--color-teal-blue);
border-top: 4px solid var(--color-navy);
```

### You Can Also Say:

- "Use brand colors" → I'll use purple, gold, green, orange
- "Match the header" → I'll use `var(--color-header)` (purple)
- "Make it pop" → I'll use bright colors like crimson, art wheel pink
- "Natural earth tones" → I'll use olive-green, brown-ochre, burnt-orange
- "Cool ocean colors" → I'll use teals, sea-green, navy
- "Warm sunset colors" → I'll use red-orange, burnt-orange, mustard

---

## 🎯 Color Combinations That Work Well

### High Energy
- Crimson + Art Wheel Pink + White
- Red Orange + Burnt Orange + Mustard

### Professional
- Navy + Teal Blue + White
- Deep Teal + Sage + Peach

### Natural/Organic
- Olive Green + Forest + Brown Ochre
- Sage + Dark Leaf + Peach

### Brand Identity
- Purple + Gold + Green (your core!)
- Violet + Bkg Golden Yellow + White

### Art Wheel Themed
- Art Wheel Blue + Art Wheel Pink + Art Wheel Orange
- Art Wheel Red + Art Wheel Green + White

---

## 📝 Quick Tips

1. **Brand colors first** - Use purple, gold, green, orange for consistent identity
2. **Art wheel for features** - Use art wheel colors for the wheel page and related content
3. **Global palette for variety** - Use extended colors for cards, sections, accents
4. **Contrast matters** - Dark backgrounds need light text, light backgrounds need dark text
5. **Test readability** - Some color combos look great but are hard to read

---

## 🚀 All 26 Colors At a Glance

**Brand (5):** purple, gold, green, orange, black
**Art Wheel (6):** blue, pink, red, orange, green, pale-grey-blue
**Global (20):** violet, eggplant, plum-red, crimson, red-orange, burnt-orange, bkg-golden-yellow, mustard, peach, brown-ochre, olive-green, forest, dark-leaf, sage, aqua-green, sea-green, deep-teal, teal-blue, navy, black-green

**Total: 26 unique colors** (some overlap between brand and global palettes)
