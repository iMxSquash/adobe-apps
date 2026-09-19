"use client";

import Image from "next/image";
import { useState } from "react";

import { getEmbedUrl, getThumbnailUrl } from "@/lib/youtube";

import { SECONDARY_BUTTON_CLASS } from "./styles";

const PREVIEW_WIDTH = 320;
const PREVIEW_HEIGHT = 180;

/** Thumbnail facade like in the app: the YouTube iframe only mounts on demand. */
export function YoutubePreview({ youtubeId }: { youtubeId: string }) {
  const [playingId, setPlayingId] = useState<string | null>(null);

  if (playingId === youtubeId) {
    return (
      <iframe
        title="Aperçu de la vidéo"
        src={getEmbedUrl(youtubeId, window.location.origin)}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        className="aspect-video w-full max-w-sm rounded border border-border"
      />
    );
  }

  return (
    <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded border border-border">
      <Image
        src={getThumbnailUrl(youtubeId, "mqdefault")}
        alt="Vignette de la vidéo"
        width={PREVIEW_WIDTH}
        height={PREVIEW_HEIGHT}
        className="size-full object-cover"
      />
      <button
        type="button"
        onClick={() => setPlayingId(youtubeId)}
        className={`${SECONDARY_BUTTON_CLASS} absolute inset-0 m-auto h-fit w-fit`}
      >
        Lire l&apos;aperçu
      </button>
    </div>
  );
}
