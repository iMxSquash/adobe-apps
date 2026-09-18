import { AppShell } from "@/components/adobe/AppShell";
import { HomeScreen } from "@/components/adobe/HomeScreen";
import { PHOTOSHOP_MENUS } from "@/lib/adobe-menus";
import { APP_LABEL } from "@/lib/adobe-theme";

export default function PhotoshopPage() {
  return (
    <AppShell appLabel={APP_LABEL.photoshop} menus={PHOTOSHOP_MENUS}>
      <HomeScreen
        appLabel={APP_LABEL.photoshop}
        items={[]}
        emptyMessage="Aucune œuvre pour le moment (arrivent en phase 2)."
      />
    </AppShell>
  );
}
