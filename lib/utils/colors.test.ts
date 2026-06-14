import { describe, it, expect } from "vitest";
import { getInitials, sortParticipants } from "./colors";

describe("getInitials", () => {
  it("returns single letter for one-word name", () => {
    expect(getInitials("Alice")).toBe("A");
  });

  it("returns first + last initials for multi-word name", () => {
    expect(getInitials("Alice Bob")).toBe("AB");
  });

  it("uses first and last word for 3+ word name", () => {
    expect(getInitials("Jean Pierre Dupont")).toBe("JD");
  });

  it("returns empty string for empty input", () => {
    expect(getInitials("")).toBe("");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(getInitials("   ")).toBe("");
  });

  it("uppercases the initials", () => {
    expect(getInitials("alice bob")).toBe("AB");
  });
});

describe("sortParticipants", () => {
  it("sorts by color order", () => {
    const list = [
      { name: "Bob", color: "#F97316" },   // Spritz Orange (index 1)
      { name: "Alice", color: "#2563EB" },  // Alpine Blue (index 0)
    ];
    const sorted = sortParticipants(list);
    expect(sorted[0].name).toBe("Alice");
    expect(sorted[1].name).toBe("Bob");
  });

  it("uses name as tiebreak for same color", () => {
    const list = [
      { name: "Zoe", color: "#2563EB" },
      { name: "Alice", color: "#2563EB" },
    ];
    const sorted = sortParticipants(list);
    expect(sorted[0].name).toBe("Alice");
    expect(sorted[1].name).toBe("Zoe");
  });

  it("places unknown colors last", () => {
    const list = [
      { name: "Unknown", color: "#000000" },
      { name: "Alice", color: "#2563EB" },
    ];
    const sorted = sortParticipants(list);
    expect(sorted[0].name).toBe("Alice");
    expect(sorted[1].name).toBe("Unknown");
  });

  it("does not mutate the original array", () => {
    const list = [
      { name: "Bob", color: "#F97316" },
      { name: "Alice", color: "#2563EB" },
    ];
    const original = [...list];
    sortParticipants(list);
    expect(list).toEqual(original);
  });
});
