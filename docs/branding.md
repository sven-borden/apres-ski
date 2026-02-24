# Branding Guidelines

## Brand Personality

**Crisp, Functional, Cozy, Modern.** The visual language contrasts the cold, sharp alpine outdoors with the warm, inviting indoors of a ski chalet. Clean lines and ample whitespace evoke fresh snow, while warm accent colors recall fireside gatherings.

## Color Palette — "Modern Alpine"

Eleven design tokens defined as CSS custom properties in `app/globals.css` and mapped to Tailwind classes via `@theme inline`.

| Token | Hex / Value | CSS Variable | Tailwind Class | Usage |
|-------|-------------|-------------|----------------|-------|
| Powder White | `#F8FAFC` | `--powder-white` | `bg-powder` | Page background |
| Glacier White | `#FFFFFF` | `--glacier-white` | `bg-glacier` | Card surfaces |
| Midnight Slate | `#0F172A` | `--midnight-slate` | `text-midnight` | Primary text |
| Alpine Blue | `#2563EB` | `--alpine-blue` | `bg-alpine` / `text-alpine` | Primary actions, links |
| Spritz Orange | `#F97316` | `--spritz-orange` | `bg-spritz` / `text-spritz` | Accent, apero highlights |
| Pine Green | `#10B981` | `--pine-green` | `bg-pine` / `text-pine` | Success, confirmed status |
| Mist Grey | `#94A3B8` | `--mist-grey` | `text-mist` | Secondary text, inactive states |
| Glass BG | `rgba(255,255,255,0.70)` | `--glass-bg` | `bg-glass` | Glassmorphism surface |
| Glass Border | `rgba(255,255,255,0.20)` | `--glass-border` | `border-glass-border` | Subtle border on glass surfaces |
| Danger Red | `#EF4444` | `--danger-red` | `bg-danger` / `text-danger` | Destructive actions, errors |
| Caution Amber | `#F59E0B` | `--caution-amber` | `bg-caution` / `text-caution` | Warnings, caution states |

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
  --glass-bg: rgba(255, 255, 255, 0.70);
  --glass-border: rgba(255, 255, 255, 0.20);
  --danger-red: #EF4444;
  --caution-amber: #F59E0B;
}

@theme inline {
  --color-powder: var(--powder-white);
  --color-glacier: var(--glacier-white);
  --color-midnight: var(--midnight-slate);
  --color-alpine: var(--alpine-blue);
  --color-spritz: var(--spritz-orange);
  --color-pine: var(--pine-green);
  --color-mist: var(--mist-grey);
  --color-glass: var(--glass-bg);
  --color-glass-border: var(--glass-border);
  --color-danger: var(--danger-red);
  --color-caution: var(--caution-amber);
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
| Glass cards | `bg-glass backdrop-blur-md border border-glass-border rounded-2xl` |
| Buttons | `rounded-full` (pill-shaped) |
| Badges / Tags | `rounded-full` |
| Mobile tab bar clearance | `pb-20 md:pb-0` on content area |

## Animations

| Name | Keyframes | Utility Class | Usage |
|------|-----------|---------------|-------|
| Pulse Glow | `pulse-glow` — scales 1→1.05→1, box-shadow fades alpine-blue glow | `.animate-glow` | Attention-drawing pulse on interactive elements |

## Logo & Icon

The favicon (`app/icon.png`) is a 32x32 PNG with:
- **Background:** Alpine Blue (`#2563EB`) rounded rectangle
- **Foreground:** White mountain silhouette — two overlapping peaks with a horizontal baseline

PNG icons for PWA are generated at 192px and 512px in `public/icons/`.

## PWA Theming

Defined in `app/manifest.ts`:

| Property | Value |
|----------|-------|
| `theme_color` | `#2563EB` (Alpine Blue) |
| `background_color` | `#F8FAFC` (Powder White) |
| `display` | `standalone` |
