import { describe, expect, it } from "vitest";

import type { Artwork } from "@/lib/content";

import { documentBase, groupArtworksIntoDocuments } from "./documents";

function artwork(overrides: Partial<Artwork>): Artwork {
  return {
    id: "id",
    app: "photoshop",
    title: "Affiche",
    slug: "affiche",
    image_url: "https://example.com/a.png",
    layer_name: "Fond",
    description: "Description",
    width: 100,
    height: 100,
    sort_order: 0,
    visible: true,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("groupArtworksIntoDocuments", () => {
  it("returns no document for no artwork", () => {
    expect(groupArtworksIntoDocuments([])).toEqual([]);
  });

  it("puts artworks sharing a title into one document, one layer each", () => {
    const documents = groupArtworksIntoDocuments([
      artwork({ id: "a", layer_name: "Fond" }),
      artwork({ id: "b", layer_name: "Texte", slug: "affiche-texte" }),
    ]);

    expect(documents).toHaveLength(1);
    expect(documents[0].layers.map((layer) => layer.id)).toEqual(["a", "b"]);
    expect(documents[0].id).toBe("a");
  });

  it("matches titles regardless of case and surrounding spaces", () => {
    const documents = groupArtworksIntoDocuments([
      artwork({ id: "a", title: "Affiche" }),
      artwork({ id: "b", title: " affiche " }),
    ]);

    expect(documents).toHaveLength(1);
  });

  it("keeps different titles as separate documents in first-seen order", () => {
    const documents = groupArtworksIntoDocuments([
      artwork({ id: "a", title: "Logo" }),
      artwork({ id: "b", title: "Affiche" }),
      artwork({ id: "c", title: "Logo", layer_name: "Ombre" }),
    ]);

    expect(documents.map((document) => document.title)).toEqual(["Logo", "Affiche"]);
    expect(documents[0].layers.map((layer) => layer.id)).toEqual(["a", "c"]);
  });
});

describe("documentBase", () => {
  it("returns the first layer", () => {
    const [document] = groupArtworksIntoDocuments([
      artwork({ id: "a", description: "Premier" }),
      artwork({ id: "b", description: "Second" }),
    ]);

    expect(documentBase(document).description).toBe("Premier");
  });
});
