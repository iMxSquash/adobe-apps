import { getArtworks, getVideos } from "@/lib/content";
import { getRequestApp } from "@/lib/request-app";
import { APP_SEO, PORTFOLIO_URL } from "@/lib/seo";

export async function GET() {
  const app = await getRequestApp();
  if (!app) return new Response(null, { status: 404 });

  const { origin, title, description } = APP_SEO[app];
  const works =
    app === "premierepro"
      ? (await getVideos()).map((video) => ({ title: video.title, text: video.description }))
      : (await getArtworks(app)).map((artwork) => ({
          title: artwork.title,
          text: artwork.description,
        }));

  const lines = [
    `# ${title}`,
    "",
    `> ${description}`,
    "",
    `Site : ${origin}/. Projet du [portfolio d'Elwen](${PORTFOLIO_URL}).`,
    "",
    "## Contenu",
    "",
    ...works.map((work) => `- ${work.title}${work.text ? `: ${work.text}` : ""}`),
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
