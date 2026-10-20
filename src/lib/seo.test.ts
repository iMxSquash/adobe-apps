import { describe, expect, it } from "vitest";

import { appForHost } from "./app-host";
import { APP_SEO, artworkToJsonLd, buildAppJsonLd, serializeJsonLd, videoToJsonLd } from "./seo";

describe("appForHost", () => {
  it("maps each production subdomain to its app", () => {
    expect(appForHost("photoshop.elwen.dev")).toBe("photoshop");
    expect(appForHost("premierepro.elwen.dev")).toBe("premierepro");
  });

  it("maps local subdomains and ignores unknown hosts", () => {
    expect(appForHost("illustrator.localhost")).toBe("illustrator");
    expect(appForHost("adobe-apps.vercel.app")).toBeUndefined();
  });
});

describe("APP_SEO", () => {
  it.each(Object.entries(APP_SEO))(
    "keeps %s title and description within search snippet limits",
    (_app, seo) => {
      expect(seo.title.length).toBeLessThanOrEqual(60);
      expect(seo.description.length).toBeLessThanOrEqual(160);
    },
  );
});

describe("buildAppJsonLd", () => {
  it("authors the website with the portfolio person and lists the works after it", () => {
    const work = { "@type": "VisualArtwork", name: "Affiche" };
    const graph = buildAppJsonLd("photoshop", [work])["@graph"];
    expect(graph[0]).toMatchObject({
      "@type": "WebSite",
      url: "https://photoshop.elwen.dev",
      author: { "@id": "https://elwen.dev/#person" },
    });
    expect(graph[1]).toBe(work);
  });
});

describe("work JSON-LD", () => {
  it("describes an artwork without an empty description", () => {
    const node = artworkToJsonLd({
      title: "Affiche",
      description: "",
      image_url: "https://x/a.png",
    });
    expect(node.description).toBeUndefined();
    expect(node).toMatchObject({ "@type": "VisualArtwork", image: "https://x/a.png" });
  });

  it("gives a video the fields Google requires, falling back to the title for the description", () => {
    const node = videoToJsonLd({
      title: "Montage",
      description: null,
      youtube_id: "abcdefghijk",
      created_at: "2026-01-02T00:00:00Z",
    });
    expect(node).toMatchObject({
      "@type": "VideoObject",
      description: "Montage",
      thumbnailUrl: "https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg",
      uploadDate: "2026-01-02T00:00:00Z",
    });
  });
});

describe("serializeJsonLd", () => {
  it("escapes < so content cannot close the script tag", () => {
    expect(serializeJsonLd({ name: "</script>" })).not.toContain("</script>");
  });
});
