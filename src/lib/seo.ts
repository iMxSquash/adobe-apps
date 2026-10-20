import type { Metadata } from "next";

import type { AppId } from "@/lib/app-host";
import type { Artwork, Video } from "@/lib/content";
import { getThumbnailUrl } from "@/lib/youtube";

export const PORTFOLIO_URL = "https://elwen.dev";
/** The portfolio's `Person` entity: authoring every site with this `@id` ties them to one identity. */
const PERSON_ID = `${PORTFOLIO_URL}/#person`;

interface AppSeo {
  origin: string;
  /** Short brand-first title (50-60 characters). */
  title: string;
  /** Meta description (about 155 characters). */
  description: string;
}

export const APP_SEO: Record<AppId, AppSeo> = {
  photoshop: {
    origin: "https://photoshop.elwen.dev",
    title: "Photoshop dans le navigateur : créations d'Elwen",
    description:
      "Photoshop recréé dans le navigateur pour présenter les créations graphiques d'Elwen, ouvertes comme des fichiers avec leurs calques et leurs commentaires.",
  },
  illustrator: {
    origin: "https://illustrator.elwen.dev",
    title: "Illustrator dans le navigateur : créations d'Elwen",
    description:
      "Illustrator recréé dans le navigateur pour présenter les illustrations d'Elwen, ouvertes comme des fichiers avec leurs calques et leurs commentaires.",
  },
  premierepro: {
    origin: "https://premierepro.elwen.dev",
    title: "Premiere Pro dans le navigateur : montages d'Elwen",
    description:
      "Premiere Pro recréé dans le navigateur pour visionner les montages vidéo d'Elwen dans le moniteur du programme, avec le chutier et la timeline.",
  },
};

export function buildAppMetadata(app: AppId): Metadata {
  const { origin, title, description } = APP_SEO[app];
  return {
    metadataBase: new URL(origin),
    title: { absolute: title },
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url: origin,
      siteName: title,
      title,
      description,
    },
    twitter: { card: "summary", title, description },
  };
}

/** `WebSite` of an app, authored by the portfolio owner, plus the works it shows. */
export function buildAppJsonLd(app: AppId, works: object[]) {
  const { origin, title, description } = APP_SEO[app];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: origin,
        name: title,
        description,
        inLanguage: "fr-FR",
        author: { "@id": PERSON_ID },
        isPartOf: { "@id": `${PORTFOLIO_URL}/#website` },
      },
      ...works,
    ],
  };
}

export function artworkToJsonLd(artwork: Pick<Artwork, "title" | "description" | "image_url">) {
  return {
    "@type": "VisualArtwork",
    name: artwork.title,
    description: artwork.description || undefined,
    image: artwork.image_url,
    creator: { "@id": PERSON_ID },
  };
}

export function videoToJsonLd(
  video: Pick<Video, "title" | "description" | "youtube_id" | "created_at">,
) {
  return {
    "@type": "VideoObject",
    name: video.title,
    description: video.description ?? video.title,
    thumbnailUrl: getThumbnailUrl(video.youtube_id, "hqdefault"),
    uploadDate: video.created_at,
    embedUrl: `https://www.youtube-nocookie.com/embed/${video.youtube_id}`,
    creator: { "@id": PERSON_ID },
  };
}

/** JSON for an inline `<script type="application/ld+json">`: `<` is escaped so content can never close the tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
