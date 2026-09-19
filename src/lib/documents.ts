import { slugify } from "@/lib/admin/slug";
import type { Artwork } from "@/lib/content";

/** A Photoshop/Illustrator file: every artwork sharing a title is one layer of it. */
export interface ArtworkDocument {
  /** Id of the first layer: stable as long as that layer exists. */
  id: string;
  title: string;
  /** Bottom to top, in `sort_order`. */
  layers: Artwork[];
}

/** Titles are compared through their slug so "Affiche" and "affiche " are the same file. */
export function documentKey(title: string): string {
  return slugify(title);
}

/** Groups artworks (already ordered by `sort_order`) into documents, keeping first-seen order. */
export function groupArtworksIntoDocuments(artworks: Artwork[]): ArtworkDocument[] {
  const documents = new Map<string, ArtworkDocument>();
  for (const artwork of artworks) {
    const key = documentKey(artwork.title);
    const document = documents.get(key);
    if (document) document.layers.push(artwork);
    else documents.set(key, { id: artwork.id, title: artwork.title, layers: [artwork] });
  }
  return [...documents.values()];
}

/** The file-level fields (comment, dimensions, slug) come from its first layer. */
export function documentBase(document: ArtworkDocument): Artwork {
  return document.layers[0];
}
