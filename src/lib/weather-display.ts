// WMO weather code → emoji + French label (PROJECT.md §5.4). Presentation only.
const CODES: Record<number, { emoji: string; label: string }> = {
  0: { emoji: "☀️", label: "Ciel dégagé" },
  1: { emoji: "🌤️", label: "Plutôt dégagé" },
  2: { emoji: "⛅", label: "Partiellement nuageux" },
  3: { emoji: "☁️", label: "Couvert" },
  45: { emoji: "🌫️", label: "Brouillard" },
  48: { emoji: "🌫️", label: "Brouillard givrant" },
  51: { emoji: "🌦️", label: "Bruine légère" },
  53: { emoji: "🌦️", label: "Bruine" },
  55: { emoji: "🌧️", label: "Bruine dense" },
  61: { emoji: "🌦️", label: "Pluie faible" },
  63: { emoji: "🌧️", label: "Pluie" },
  65: { emoji: "🌧️", label: "Forte pluie" },
  71: { emoji: "🌨️", label: "Neige faible" },
  73: { emoji: "🌨️", label: "Neige" },
  75: { emoji: "❄️", label: "Fortes chutes de neige" },
  77: { emoji: "🌨️", label: "Grains de neige" },
  80: { emoji: "🌦️", label: "Averses" },
  81: { emoji: "🌧️", label: "Averses" },
  82: { emoji: "⛈️", label: "Violentes averses" },
  85: { emoji: "🌨️", label: "Averses de neige" },
  86: { emoji: "❄️", label: "Fortes averses de neige" },
  95: { emoji: "⛈️", label: "Orage" },
  96: { emoji: "⛈️", label: "Orage grêleux" },
  99: { emoji: "⛈️", label: "Violent orage" },
};

export function weatherEmoji(code: number): { emoji: string; label: string } {
  return CODES[code] ?? { emoji: "🌡️", label: "Conditions inconnues" };
}

/** Playful snow caption bucketed by depth in cm (PROJECT.md §5.4). */
export function snowVibe(cm: number): string {
  if (cm >= 100) return "Poudreuse de rêve";
  if (cm >= 50) return "Belle couche";
  if (cm >= 30) return "De quoi rider";
  if (cm >= 10) return "Ça tient";
  if (cm > 0) return "Quelques traces";
  return "Pas de neige";
}
