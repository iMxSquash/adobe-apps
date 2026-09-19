import { DocumentWorkspace } from "@/components/adobe/document/DocumentWorkspace";
import { PHOTOSHOP_MENUS } from "@/lib/adobe-menus";
import { APP_LABEL } from "@/lib/adobe-theme";
import { getArtworks } from "@/lib/content";

import { PHOTOSHOP_TOOLS } from "./tools";

export default async function PhotoshopPage() {
  const artworks = await getArtworks("photoshop");

  return (
    <DocumentWorkspace
      appLabel={APP_LABEL.photoshop}
      menus={PHOTOSHOP_MENUS}
      tools={PHOTOSHOP_TOOLS}
      artworks={artworks}
    />
  );
}
