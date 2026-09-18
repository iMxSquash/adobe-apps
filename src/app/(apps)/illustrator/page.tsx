import { AppShell } from "@/components/adobe/AppShell";
import { HomeScreen } from "@/components/adobe/HomeScreen";
import { ILLUSTRATOR_MENUS } from "@/lib/adobe-menus";
import { APP_LABEL } from "@/lib/adobe-theme";

export default function IllustratorPage() {
  return (
    <AppShell appLabel={APP_LABEL.illustrator} menus={ILLUSTRATOR_MENUS}>
      <HomeScreen
        appLabel={APP_LABEL.illustrator}
        items={[]}
        emptyMessage="Aucune œuvre pour le moment (arrivent en phase 2)."
      />
    </AppShell>
  );
}
