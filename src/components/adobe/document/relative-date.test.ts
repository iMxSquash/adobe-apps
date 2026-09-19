import { describe, expect, it } from "vitest";

import { formatRelativeDate } from "./relative-date";

const NOW = Date.parse("2026-09-19T12:00:00Z");
const ago = (seconds: number) => new Date(NOW - seconds * 1000).toISOString();

// Intl separates number and unit with a non-breaking space.
const format = (seconds: number) => formatRelativeDate(ago(seconds), NOW).replace(/\s/g, " ");

describe("formatRelativeDate", () => {
  it("formats days in short French", () => {
    expect(format(3 * 86_400)).toBe("il y a 3 j");
  });

  it("formats hours and minutes", () => {
    expect(format(2 * 3_600)).toBe("il y a 2 h");
    expect(format(5 * 60)).toBe("il y a 5 min");
  });

  it("formats months and years", () => {
    expect(format(60 * 86_400)).toBe("il y a 2 m.");
    expect(format(800 * 86_400)).toBe("il y a 2 a");
  });

  it("uses natural wording for the previous year", () => {
    expect(format(400 * 86_400)).toBe("l’an dernier");
  });

  it("handles a date less than a minute old", () => {
    expect(format(10)).toMatch(/maintenant|0 s/);
  });

  it("clamps a timestamp ahead of now to the present", () => {
    expect(format(-3_600)).not.toMatch(/dans/);
  });
});
