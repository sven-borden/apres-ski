# Branding Guidelines

## Brand Personality

**Crisp, Functional, Cozy, Modern.** The visual language contrasts the cold, sharp alpine outdoors with the warm, inviting indoors of a ski chalet. Clean lines and ample whitespace evoke fresh snow, while warm accent colors recall fireside gatherings.

## Color Palette — "Modern Alpine"

Seven design tokens defined as CSS custom properties in `app/globals.css` and mapped to Tailwind classes via `@theme inline`.

| Token | Hex | CSS Variable | Tailwind Class | Usage |
|-------|-----|-------------|----------------|-------|
| Powder White | `#F8FAFC` | `--powder-white` | `bg-powder` | Page background |
| Glacier White | `#FFFFFF` | `--glacier-white` | `bg-glacier` | Card surfaces |
| Midnight Slate | `#0F172A` | `--midnight-slate` | `text-midnight` | Primary text |
| Alpine Blue | `#2563EB` | `--alpine-blue` | `bg-alpine` / `text-alpine` | Primary actions, links |
| Spritz Orange | `#F97316` | `--spritz-orange` | `bg-spritz` / `text-spritz` | Accent, apero highlights |
| Pine Green | `#10B981` | `--pine-green` | `bg-pine` / `text-pine` | Success, confirmed status |
| Mist Grey | `#94A3B8` | `--mist-grey` | `text-mist` | Secondary text, inactive states |

### CSS Implementation

```css
@import "tailwindcss";

:root {
  --powder-white: #F8FAFC;
  --glacier-white: #FFFFFF;
  --midnight-slate: #0F172A;
  --alpine-blue: #2563EB;
  --spritz-orange: #F97316;
  --pine-green: #10B981;
  --mist-grey: #94A3B8;
}

@theme inline {
  --color-powder: var(--powder-white);
  --color-glacier: var(--glacier-white);
  --color-midnight: var(--midnight-slate);
  --color-alpine: var(--alpine-blue);
  --color-spritz: var(--spritz-orange);
  --color-pine: var(--pine-green);
  --color-mist: var(--mist-grey);
}
```

## Participant Colors

A 10-color avatar palette defined in `lib/utils/colors.ts`. Each participant selects one during setup.

| Name | Hex |
|------|-----|
| Alpine Blue | `#2563EB` |
| Spritz Orange | `#F97316` |
| Pine Green | `#10B981` |
| Sunset Rose | `#E11D48` |
| Summit Purple | `#7C3AED` |
| Glacier Teal | `#0891B2` |
| Fireside Amber | `#D97706` |
| Berry Magenta | `#C026D3` |
| Storm Slate | `#475569` |
| Powder Pink | `#EC4899` |

## Typography

- **Font family:** Inter (loaded via `next/font/google`)
- **Weights:** 400 (body), 500 (labels), 600 (headings), 700 (emphasis)
- **Rendering:** `antialiased` on body

## Shape Tokens

| Element | Classes |
|---------|---------|
| Cards | `rounded-2xl shadow-sm p-5` |
| Buttons | `rounded-full` (pill-shaped) |
| Badges / Tags | `rounded-full` |
| Mobile tab bar clearance | `pb-20 md:pb-0` on content area |

## Logo & Icon

The favicon (`app/icon.svg`) is a 32x32 SVG with:
- **Background:** Alpine Blue (`#2563EB`) rounded rectangle (`rx="6"`)
- **Foreground:** White mountain silhouette — two overlapping peaks with a horizontal baseline

PNG icons for PWA are generated at 192px and 512px in `public/icons/`.

## PWA Theming

Defined in `app/manifest.ts`:

| Property | Value |
|----------|-------|
| `theme_color` | `#2563EB` (Alpine Blue) |
| `background_color` | `#F8FAFC` (Powder White) |
| `display` | `standalone` |
