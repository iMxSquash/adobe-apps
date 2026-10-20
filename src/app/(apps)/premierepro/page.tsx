import { AppSeoSummary } from "@/components/seo/AppSeoSummary";
import { PremiereWorkspace } from "@/components/premiere/PremiereWorkspace";
import { PREMIEREPRO_MENUS } from "@/lib/adobe-menus";
import { APP_LABEL } from "@/lib/adobe-theme";
import { getVideos } from "@/lib/content";
import { videoToJsonLd } from "@/lib/seo";
import { isValidYoutubeId } from "@/lib/youtube";

export default async function PremiereProPage() {
  const videos = (await getVideos()).filter((video) => {
    const isValid = isValidYoutubeId(video.youtube_id);
    if (!isValid) console.error(`Skipping video "${video.slug}": invalid youtube_id`);
    return isValid;
  });

  return (
    <>
      <AppSeoSummary app="premierepro" works={videos} jsonLd={videos.map(videoToJsonLd)} />
      <PremiereWorkspace
        appLabel={APP_LABEL.premierepro}
        menus={PREMIEREPRO_MENUS}
        videos={videos}
      />
    </>
  );
}
