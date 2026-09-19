import Image from "next/image";
import Link from "next/link";

export interface HomeScreenItem {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  thumbnailUrl?: string;
}

interface HomeScreenProps {
  appLabel: string;
  items: HomeScreenItem[];
  emptyMessage: string;
  /** When provided, a click opens the item in place instead of navigating to its href. */
  onOpen?: (id: string) => void;
}

export function HomeScreen({ appLabel, items, emptyMessage, onOpen }: HomeScreenProps) {
  return (
    <div className="flex h-full min-h-0">
      <aside className="hidden w-48 shrink-0 flex-col gap-1 border-r border-border bg-surface-1 p-4 text-xs sm:flex">
        <span className="text-text">Accueil</span>
        <span className="text-text-dim">Fichiers</span>
      </aside>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <h1 className="mb-4 text-lg font-medium text-text">Bienvenue dans {appLabel}</h1>
        {items.length === 0 ? (
          <p className="text-sm text-text-dim">{emptyMessage}</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={(event) => {
                    if (!onOpen) return;
                    event.preventDefault();
                    onOpen(item.id);
                  }}
                  className="group block overflow-hidden rounded border border-border bg-surface-1 hover:border-accent"
                >
                  <div className="relative aspect-video bg-surface-2">
                    {item.thumbnailUrl && (
                      <Image src={item.thumbnailUrl} alt="" fill className="object-cover" />
                    )}
                  </div>
                  <div className="p-2">
                    <p className="truncate text-xs text-text">{item.title}</p>
                    {item.subtitle && (
                      <p className="truncate text-[11px] text-text-dim">{item.subtitle}</p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
