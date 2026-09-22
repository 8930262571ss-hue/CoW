---
name: Velvet & Gold
colors:
  surface: '#141310'
  surface-dim: '#141310'
  surface-bright: '#3a3935'
  surface-container-lowest: '#0f0e0b'
  surface-container-low: '#1c1c18'
  surface-container: '#20201c'
  surface-container-high: '#2b2a26'
  surface-container-highest: '#363530'
  on-surface: '#e6e2db'
  on-surface-variant: '#c4c7c7'
  inverse-surface: '#e6e2db'
  inverse-on-surface: '#31302c'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c8c6c5'
  primary: '#c8c6c5'
  on-primary: '#313030'
  primary-container: '#1b1b1b'
  on-primary-container: '#848383'
  inverse-primary: '#5f5e5e'
  secondary: '#ffb2b7'
  on-secondary: '#5f1320'
  secondary-container: '#7f2c37'
  on-secondary-container: '#ff9da5'
  tertiary: '#e6c180'
  on-tertiary: '#412d00'
  tertiary-container: '#261900'
  on-tertiary-container: '#9e7f44'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#ffdadb'
  secondary-fixed-dim: '#ffb2b7'
  on-secondary-fixed: '#40000e'
  on-secondary-fixed-variant: '#7c2a35'
  tertiary-fixed: '#ffdea7'
  tertiary-fixed-dim: '#e6c180'
  on-tertiary-fixed: '#271900'
  on-tertiary-fixed-variant: '#5c420c'
  background: '#141310'
  on-background: '#e6e2db'
  surface-variant: '#363530'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Sora
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Sora
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Sora
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.15em
  price-display:
    fontFamily: Sora
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-margin: 24px
  gutter: 16px
  section-gap: 48px
---

## Brand & Style
The design system embodies an "Intimate Indulgence" philosophy, targeting a premium clientele who value refinement and high-end mobile experiences. The visual direction is rooted in **Modern Luxury** with a heavy emphasis on **Tactile Elegance**. 

The aesthetic leverages a high-contrast interaction between "Velvet Charcoal" and "Champagne Gold." It uses "Ivory Cream" to provide breathing room, ensuring the dark elements feel intentional and premium rather than heavy. The emotional response is one of exclusivity, warmth, and sophistication. The design should feel less like an app and more like a leather-bound, gold-leafed menu found in a high-end lounge.

## Colors
This design system utilizes a sophisticated palette centered on dark, rich tones. 

- **Velvet Charcoal (#1B1B1B):** The primary surface color, providing a deep, matte background.
- **Deep Wine (#6E1F2B):** Used for subtle depth, highlights, or secondary interactive states to add a layer of "richness."
- **Champagne Gold (#C9A667):** The signature accent for high-importance actions, pricing, and structural dividers.
- **Ivory Cream (#F7F3EC):** Used for primary text on dark backgrounds and as the base surface for light-themed "Special Edition" cards or components.
- **Deep Emerald (#0E3B2E):** Reserved for subtle status indicators or "Signature Item" badges to provide a cool contrast to the warmth of the gold.

## Typography
The typographic hierarchy creates a dialogue between tradition and modernity. 

**Playfair Display** serves as the primary voice for storytelling and headlines, conveying authority and timeless elegance. **Sora** is utilized for body copy and functional UI to ensure maximum legibility at smaller sizes while maintaining a modern, clean edge. 

**Currency Formatting:** Always use the Indian Rupee symbol (₹). Use Indian digit grouping (e.g., ₹1,49,000 instead of ₹149,000). Price displays should use a medium weight in Sora to stand out as "data" against the "literary" feel of the serif headlines.

## Layout & Spacing
The layout follows a **Fixed Grid** approach for desktop and tablet, centered with generous side margins to create an "Editorial" feel. On mobile, a standard fluid grid is used with 24px margins to prevent content from feeling crowded.

Spacing is intentionally loose. Elements are given room to breathe, suggesting a lack of hurry. Use the 8px base unit, but prioritize larger increments (24px, 32px, 48px) for vertical separation between distinct story sections or product categories.

## Elevation & Depth
Elevation is conveyed through **Tonal Layers** and **Subtle Metallics** rather than heavy drop shadows.

- **Surface Tiers:** Backgrounds are `#1B1B1B`. Raised cards or containers use a slightly lighter charcoal or a very subtle gradient of `#1B1B1B` to `#242424`.
- **Metallic Borders:** Depth is defined by 1px solid lines in `Champagne Gold` (#C9A667) at 30% opacity for inactive states and 100% for active states.
- **Soft Glow:** For primary gold elements (like buttons), a very soft, diffused outer glow (blur: 20px, opacity: 15%) using the gold hex can be applied to simulate light reflecting off a metallic surface.

## Shapes
The shape language is "Tailored." A standard radius of **12px** (0.75rem) is used for cards and inputs, while **16px** (1rem) is used for larger sections. This provides a "Softened Minimalist" look that feels friendlier than sharp corners but more professional than fully rounded bubbles.

Interactive buttons may use the "Pill" shape (rounded-full) if they contain exclusively text labels, further distinguishing them from structural containers.

## Components
- **Buttons:** Primary CTAs feature a linear gradient (45-degree angle) from `#C9A667` to `#E6D2AA` to simulate gold foil. Text on gold buttons is `#1B1B1B` (bold). Secondary buttons use a transparent background with a 1px gold border.
- **Dividers:** Use ultra-thin (0.5px to 1px) lines. Use a horizontal gold line with a small diamond or circular motif in the center for section breaks.
- **Input Fields:** Dark backgrounds (`#121212`) with Ivory Cream text. The bottom border should animate to a solid Gold line on focus.
- **Cards:** Product cards use the Ivory Cream surface for light mode variants with Charcoal text, or Deep Wine surfaces for "Special Edition" items.
- **Chips/Badges:** Small, uppercase labels (Sora) with high letter spacing. Deep Emerald background with Ivory text for "New" or "Signature" status.
- **Icons:** Use thin-line (1px stroke) icons. Gold icons for primary navigation on dark backgrounds; Charcoal icons for light surface components.
- **Motifs:** Incorporate a very subtle noise texture (3% opacity) on dark surfaces to mimic the feel of velvet or premium cardstock.