import { describe, expect, it } from "vitest";

import { extractYoutubeId, getEmbedUrl, getThumbnailUrl, isValidYoutubeId } from "./youtube";

describe("isValidYoutubeId", () => {
  it("accepts an 11 character id", () => {
    expect(isValidYoutubeId("dQw4w9WgXcQ")).toBe(true);
    expect(isValidYoutubeId("a-_B1c2D3e4")).toBe(true);
  });

  it("rejects ids of the wrong length", () => {
    expect(isValidYoutubeId("")).toBe(false);
    expect(isValidYoutubeId("dQw4w9WgXc")).toBe(false);
    expect(isValidYoutubeId("dQw4w9WgXcQQ")).toBe(false);
  });

  it("rejects characters that could break out of a URL", () => {
    expect(isValidYoutubeId("dQw4w9WgX/Q")).toBe(false);
    expect(isValidYoutubeId("dQw4w9WgX?Q")).toBe(false);
    expect(isValidYoutubeId("dQw4w9WgX Q")).toBe(false);
  });
});

describe("getEmbedUrl", () => {
  it("builds a youtube-nocookie url with the IFrame API enabled", () => {
    const url = new URL(getEmbedUrl("dQw4w9WgXcQ", "https://premierepro.elwen.dev"));

    expect(url.origin).toBe("https://www.youtube-nocookie.com");
    expect(url.pathname).toBe("/embed/dQw4w9WgXcQ");
    expect(url.searchParams.get("enablejsapi")).toBe("1");
    expect(url.searchParams.get("origin")).toBe("https://premierepro.elwen.dev");
  });

  it("throws on an invalid id instead of building a url", () => {
    expect(() => getEmbedUrl("../evil", "https://elwen.dev")).toThrow("Invalid YouTube id");
  });
});

describe("getThumbnailUrl", () => {
  it("points to the i.ytimg.com thumbnail of the requested quality", () => {
    expect(getThumbnailUrl("dQw4w9WgXcQ", "mqdefault")).toBe(
      "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    );
  });

  it("throws on an invalid id", () => {
    expect(() => getThumbnailUrl("nope", "hqdefault")).toThrow("Invalid YouTube id");
  });
});

describe("extractYoutubeId", () => {
  const ID = "dQw4w9WgXcQ";

  it.each([
    `https://www.youtube.com/watch?v=${ID}`,
    `https://www.youtube.com/watch?feature=share&v=${ID}&t=42s`,
    `https://youtu.be/${ID}`,
    `https://youtu.be/${ID}?si=abc`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://www.youtube.com/embed/${ID}`,
  ])("extracts the id from %s", (url) => {
    expect(extractYoutubeId(url)).toBe(ID);
  });

  it("returns null for unrecognized input", () => {
    expect(extractYoutubeId("")).toBeNull();
    expect(extractYoutubeId("https://example.com/video")).toBeNull();
    expect(extractYoutubeId("https://www.youtube.com/watch?v=short")).toBeNull();
  });
});
