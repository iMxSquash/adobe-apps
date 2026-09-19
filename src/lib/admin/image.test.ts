import { describe, expect, it } from "vitest";

import { detectImageMime, isValidUploadPath, storagePathFromUrl } from "./image";

const bytes = (...values: number[]) => new Uint8Array(values);
const ascii = (text: string) => Array.from(text, (char) => char.charCodeAt(0));

describe("detectImageMime", () => {
  it("recognizes PNG", () => {
    expect(detectImageMime(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe(
      "image/png",
    );
  });

  it("recognizes JPEG", () => {
    expect(detectImageMime(bytes(0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0))).toBe(
      "image/jpeg",
    );
  });

  it("recognizes WebP", () => {
    const header = [...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WEBP")];
    expect(detectImageMime(new Uint8Array(header))).toBe("image/webp");
  });

  it("recognizes AVIF", () => {
    const header = [0, 0, 0, 0x1c, ...ascii("ftyp"), ...ascii("avif")];
    expect(detectImageMime(new Uint8Array(header))).toBe("image/avif");
  });

  it("rejects SVG even when it claims to be an image", () => {
    expect(detectImageMime(new Uint8Array(ascii("<svg xmlns='http://www.w3.org")))).toBeNull();
  });

  it("rejects empty and truncated input", () => {
    expect(detectImageMime(new Uint8Array())).toBeNull();
    expect(detectImageMime(bytes(0x89, 0x50))).toBeNull();
  });
});

describe("isValidUploadPath", () => {
  it("accepts generated names", () => {
    expect(isValidUploadPath("affiche-concert-1a2b3c4d.webp")).toBe(true);
  });

  it("rejects traversal, folders, uppercase and unsupported extensions", () => {
    expect(isValidUploadPath("../secret.png")).toBe(false);
    expect(isValidUploadPath("dir/poster.png")).toBe(false);
    expect(isValidUploadPath("Poster.png")).toBe(false);
    expect(isValidUploadPath("logo.svg")).toBe(false);
  });
});

describe("storagePathFromUrl", () => {
  it("extracts the object name from a public bucket url", () => {
    const url = "https://x.supabase.co/storage/v1/object/public/artworks/poster-1a2b3c4d.png";
    expect(storagePathFromUrl(url)).toBe("poster-1a2b3c4d.png");
  });

  it("returns null for foreign urls", () => {
    expect(storagePathFromUrl("https://example.com/poster.png")).toBeNull();
  });
});
