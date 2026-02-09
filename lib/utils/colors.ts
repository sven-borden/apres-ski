export const PARTICIPANT_COLORS = [
  { name: "Alpine Blue", hex: "#2563EB" },
  { name: "Spritz Orange", hex: "#F97316" },
  { name: "Pine Green", hex: "#10B981" },
  { name: "Sunset Rose", hex: "#E11D48" },
  { name: "Summit Purple", hex: "#7C3AED" },
  { name: "Glacier Teal", hex: "#0891B2" },
  { name: "Fireside Amber", hex: "#D97706" },
  { name: "Berry Magenta", hex: "#C026D3" },
  { name: "Storm Slate", hex: "#475569" },
  { name: "Powder Pink", hex: "#EC4899" },
] as const;

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === "") return "";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
