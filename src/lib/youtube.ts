export const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function isValidYoutubeId(id: string): boolean {
  return YOUTUBE_ID_PATTERN.test(id);
}

function assertValidYoutubeId(id: string): void {
  if (!isValidYoutubeId(id)) throw new Error(`Invalid YouTube id: "${id}"`);
}

export function getThumbnailUrl(id: string, quality: "mqdefault" | "hqdefault"): string {
  assertValidYoutubeId(id);
  return `https://i.ytimg.com/vi/${id}/${quality}.jpg`;
}

/** Privacy-enhanced embed, with the IFrame API enabled so the player can be driven from the page. */
export function getEmbedUrl(id: string, origin: string): string {
  assertValidYoutubeId(id);
  const params = new URLSearchParams({
    enablejsapi: "1",
    autoplay: "1",
    rel: "0",
    origin,
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}

const YOUTUBE_URL_ID = /(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/;

/** Accepts watch, youtu.be, shorts and embed URLs; the id is what gets stored, never the URL. */
export function extractYoutubeId(input: string): string | null {
  return input.match(YOUTUBE_URL_ID)?.[1] ?? null;
}
