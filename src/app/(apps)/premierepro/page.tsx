import { AppShell } from "@/components/adobe/AppShell";
import { HomeScreen } from "@/components/adobe/HomeScreen";
import { PREMIEREPRO_MENUS } from "@/lib/adobe-menus";
import { APP_LABEL } from "@/lib/adobe-theme";

export default function PremiereProPage() {
  return (
    <AppShell appLabel={APP_LABEL.premierepro} menus={PREMIEREPRO_MENUS}>
      <HomeScreen
        appLabel={APP_LABEL.premierepro}
        items={[]}
        emptyMessage="Aucune vidéo pour le moment (arrivent en phase 2)."
      />
    </AppShell>
  );
}
