import { AdminNav } from "@/components/admin/AdminNav";
import { SECONDARY_BUTTON_CLASS } from "@/components/admin/styles";
import { requireAdminPage } from "@/lib/admin/auth";

import { logout } from "./actions";

export default async function PanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user } = await requireAdminPage();

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-1 px-4 py-3">
        <AdminNav />
        <form action={logout} className="flex items-center gap-3">
          <span className="text-xs text-text-dim">{user.email}</span>
          <button type="submit" className={SECONDARY_BUTTON_CLASS}>
            Déconnexion
          </button>
        </form>
      </header>
      {children}
    </>
  );
}
