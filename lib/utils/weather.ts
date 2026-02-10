const WMO_CODES: Record<number, { emoji: string; label: string }> = {
  0: { emoji: "☀️", label: "Clear sky" },
  1: { emoji: "🌤️", label: "Mostly clear" },
  2: { emoji: "⛅", label: "Partly cloudy" },
  3: { emoji: "☁️", label: "Overcast" },
  45: { emoji: "🌫️", label: "Foggy" },
  48: { emoji: "🌫️", label: "Icy fog" },
  51: { emoji: "🌧️", label: "Light drizzle" },
  53: { emoji: "🌧️", label: "Drizzle" },
  55: { emoji: "🌧️", label: "Heavy drizzle" },
  56: { emoji: "🌧️", label: "Freezing drizzle" },
  57: { emoji: "🌧️", label: "Heavy freezing drizzle" },
  61: { emoji: "🌧️", label: "Light rain" },
  63: { emoji: "🌧️", label: "Rain" },
  65: { emoji: "🌧️", label: "Heavy rain" },
  66: { emoji: "🧊", label: "Freezing rain" },
  67: { emoji: "🧊", label: "Heavy freezing rain" },
  71: { emoji: "🌨️", label: "Light snow" },
  73: { emoji: "❄️", label: "Snow" },
  75: { emoji: "❄️", label: "Heavy snow" },
  77: { emoji: "🌨️", label: "Snow grains" },
  80: { emoji: "🌦️", label: "Light showers" },
  81: { emoji: "🌦️", label: "Showers" },
  82: { emoji: "🌦️", label: "Heavy showers" },
  85: { emoji: "🌨️", label: "Light snow showers" },
  86: { emoji: "❄️", label: "Heavy snow showers" },
  95: { emoji: "⛈️", label: "Thunderstorm" },
  96: { emoji: "⛈️", label: "Thunderstorm with hail" },
  99: { emoji: "⛈️", label: "Thunderstorm with heavy hail" },
};

export function getWeatherCondition(code: number): {
  emoji: string;
  label: string;
} {
  return WMO_CODES[code] ?? { emoji: "❓", label: "Unknown" };
}

export function getSnowVibe(snowDepthCm: number): string {
  if (snowDepthCm >= 100) return "Powder paradise!";
  if (snowDepthCm >= 50) return "Deep and dreamy";
  if (snowDepthCm >= 30) return "Solid base";
  if (snowDepthCm >= 10) return "Decent cover";
  if (snowDepthCm > 0) return "Thin cover";
  return "No snow yet";
}
