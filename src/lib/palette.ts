/**
 * Closed participant color palette (DESIGN.md). Avatar tints only.
 * Kept at L ≤ ~0.64 so white initials stay legible, and spread across hue for
 * colorblind distinctness. Names are stable ids used in data.
 */
export type PaletteColor = { id: string; value: string };

export const PARTICIPANT_PALETTE: PaletteColor[] = [
  { id: "orange", value: "oklch(0.64 0.17 47)" },
  { id: "ice", value: "oklch(0.6 0.12 233)" },
  { id: "pine", value: "oklch(0.55 0.11 150)" },
  { id: "plum", value: "oklch(0.52 0.15 330)" },
  { id: "gold", value: "oklch(0.62 0.13 78)" },
  { id: "raspberry", value: "oklch(0.57 0.18 12)" },
  { id: "teal", value: "oklch(0.6 0.09 195)" },
  { id: "slate", value: "oklch(0.52 0.04 250)" },
  { id: "brick", value: "oklch(0.5 0.13 35)" },
  { id: "lilac", value: "oklch(0.58 0.12 300)" },
];
