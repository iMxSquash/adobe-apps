import { PremiereWorkspace } from "@/components/premiere/PremiereWorkspace";
import { PREMIEREPRO_MENUS } from "@/lib/adobe-menus";
import { APP_LABEL } from "@/lib/adobe-theme";
import { getVideos } from "@/lib/content";
import { isValidYoutubeId } from "@/lib/youtube";

export default async function PremiereProPage() {
  const videos = (await getVideos()).filter((video) => {
    const isValid = isValidYoutubeId(video.youtube_id);
    if (!isValid) console.error(`Skipping video "${video.slug}": invalid youtube_id`);
    return isValid;
  });

  return (
    <PremiereWorkspace appLabel={APP_LABEL.premierepro} menus={PREMIEREPRO_MENUS} videos={videos} />
  );
}
