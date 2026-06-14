import { describe, it, expect } from "vitest";
import { getWeatherCondition, getSnowVibe } from "./weather";
import en from "@/lib/i18n/locales/en";
import type { Translations } from "@/lib/i18n/locales";

const t = en as Translations;

describe("getWeatherCondition", () => {
  it("returns clear sky for code 0", () => {
    const result = getWeatherCondition(0, t);
    expect(result).toEqual({ emoji: "☀️", label: "Clear sky" });
  });

  it("returns heavy snow for code 75", () => {
    const result = getWeatherCondition(75, t);
    expect(result).toEqual({ emoji: "❄️", label: "Heavy snow" });
  });

  it("returns thunderstorm for code 95", () => {
    const result = getWeatherCondition(95, t);
    expect(result).toEqual({ emoji: "⛈️", label: "Thunderstorm" });
  });

  it("returns unknown with question mark emoji for unrecognized code", () => {
    const result = getWeatherCondition(999, t);
    expect(result).toEqual({ emoji: "❓", label: "Unknown" });
  });
});

describe("getSnowVibe", () => {
  it("returns no snow for 0cm", () => {
    expect(getSnowVibe(0, t)).toBe("No snow yet");
  });

  it("returns thin cover for 5cm", () => {
    expect(getSnowVibe(5, t)).toBe("Thin cover");
  });

  it("returns decent cover for 10cm", () => {
    expect(getSnowVibe(10, t)).toBe("Decent cover");
  });

  it("returns solid base for 30cm", () => {
    expect(getSnowVibe(30, t)).toBe("Solid base");
  });

  it("returns deep and dreamy for 50cm", () => {
    expect(getSnowVibe(50, t)).toBe("Deep and dreamy");
  });

  it("returns powder paradise for 100cm+", () => {
    expect(getSnowVibe(100, t)).toBe("Powder paradise!");
    expect(getSnowVibe(200, t)).toBe("Powder paradise!");
  });
});
