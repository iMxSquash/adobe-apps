import { DocumentWorkspace } from "@/components/adobe/document/DocumentWorkspace";
import { ILLUSTRATOR_MENUS } from "@/lib/adobe-menus";
import { APP_LABEL } from "@/lib/adobe-theme";
import { getArtworks } from "@/lib/content";

import { ILLUSTRATOR_TOOLS } from "./tools";

export default async function IllustratorPage() {
  const artworks = await getArtworks("illustrator");

  return (
    <DocumentWorkspace
      appLabel={APP_LABEL.illustrator}
      variant="illustrator"
      menus={ILLUSTRATOR_MENUS}
      tools={ILLUSTRATOR_TOOLS}
      artworks={artworks}
    />
  );
}
