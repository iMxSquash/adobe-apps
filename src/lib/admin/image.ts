// SVG is deliberately absent: stored XSS (see check-security invariants).
export const IMAGE_EXTENSION_BY_MIME = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
} as const;

export type ImageMime = keyof typeof IMAGE_EXTENSION_BY_MIME;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** Bytes needed by `detectImageMime` to tell every supported format apart. */
export const IMAGE_SNIFF_BYTES = 12;

export function isImageMime(value: string): value is ImageMime {
  return Object.hasOwn(IMAGE_EXTENSION_BY_MIME, value);
}

function startsWith(bytes: Uint8Array, signature: readonly number[], offset = 0): boolean {
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

const ascii = (text: string): number[] => Array.from(text, (char) => char.charCodeAt(0));

/** Identifies the real format from magic bytes; the declared MIME type is never trusted. */
export function detectImageMime(bytes: Uint8Array): ImageMime | null {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47])) return "image/png";
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, ascii("RIFF")) && startsWith(bytes, ascii("WEBP"), 8)) {
    return "image/webp";
  }
  if (
    startsWith(bytes, ascii("ftyp"), 4) &&
    (startsWith(bytes, ascii("avif"), 8) || startsWith(bytes, ascii("avis"), 8))
  ) {
    return "image/avif";
  }
  return null;
}

export const ARTWORKS_BUCKET = "artworks";

// Storage object names are generated server-side as `{slug}-{8 hex}.{ext}`; anything else is rejected.
const UPLOAD_PATH_PATTERN = /^[a-z0-9][a-z0-9-]*\.(png|jpg|webp|avif)$/;

export function isValidUploadPath(path: string): boolean {
  return UPLOAD_PATH_PATTERN.test(path);
}

export function extensionOf(path: string): string {
  return path.slice(path.lastIndexOf(".") + 1);
}

/** Recovers the object name from a public bucket URL, or null for foreign URLs. */
export function storagePathFromUrl(imageUrl: string): string | null {
  const marker = `/object/public/${ARTWORKS_BUCKET}/`;
  const index = imageUrl.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(imageUrl.slice(index + marker.length).split("?")[0]);
}
