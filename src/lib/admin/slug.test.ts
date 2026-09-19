import { describe, expect, it } from "vitest";

import { slugify, uniqueSlug } from "./slug";

describe("slugify", () => {
  it("lowercases and joins words with dashes", () => {
    expect(slugify("Affiche Concert 2025")).toBe("affiche-concert-2025");
  });

  it("strips accents", () => {
    expect(slugify("Été à Paris")).toBe("ete-a-paris");
  });

  it("collapses punctuation and trims dashes", () => {
    expect(slugify("  --Logo: X / v2!--  ")).toBe("logo-x-v2");
  });

  it("falls back to a default when nothing usable remains", () => {
    expect(slugify("???")).toBe("untitled");
    expect(slugify("")).toBe("untitled");
  });
});

describe("uniqueSlug", () => {
  it("returns the base when it is free", () => {
    expect(uniqueSlug("poster", new Set())).toBe("poster");
  });

  it("appends the first free numeric suffix", () => {
    expect(uniqueSlug("poster", new Set(["poster", "poster-2"]))).toBe("poster-3");
  });
});
