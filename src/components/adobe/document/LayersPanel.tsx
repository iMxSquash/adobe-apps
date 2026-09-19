import Image from "next/image";

import type { Artwork } from "@/lib/content";

interface LayersPanelContentProps {
  artwork: Artwork;
  isLayerVisible: boolean;
  onToggleVisibility: () => void;
}

function EyeIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path d="M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8z" />
      {isOpen ? <circle cx="8" cy="8" r="2" /> : <path d="M2 14L14 2" />}
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M4 7V5a4 4 0 118 0v2h1v8H3V7h1zm2 0h4V5a2 2 0 10-4 0v2z" />
    </svg>
  );
}

export function LayersPanelContent({
  artwork,
  isLayerVisible,
  onToggleVisibility,
}: LayersPanelContentProps) {
  return (
    <div className="flex flex-col gap-2 text-[11px]">
      <div className="flex items-center justify-between text-text-dim">
        <span className="rounded border border-border bg-surface-2 px-2 py-0.5">Normal</span>
        <span>Opacité : 100 %</span>
      </div>

      <ul className="flex flex-col gap-px">
        <li className="flex items-center gap-2 bg-accent/30 p-1">
          <button
            type="button"
            aria-pressed={isLayerVisible}
            aria-label={`${isLayerVisible ? "Masquer" : "Afficher"} le calque ${artwork.layer_name}`}
            onClick={onToggleVisibility}
            className="flex h-6 w-6 shrink-0 items-center justify-center text-text-dim hover:text-text"
          >
            <EyeIcon isOpen={isLayerVisible} />
          </button>
          <span className="relative h-8 w-8 shrink-0 overflow-hidden border border-border bg-surface-2">
            <Image src={artwork.image_url} alt="" fill sizes="32px" className="object-cover" />
          </span>
          <span className="truncate text-text">{artwork.layer_name}</span>
        </li>

        <li className="flex items-center gap-2 p-1">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center text-text-dim">
            <EyeIcon isOpen />
          </span>
          <span className="h-8 w-8 shrink-0 border border-border bg-white" />
          <span className="flex-1 truncate italic text-text">Arrière-plan</span>
          <span className="text-text-dim" role="img" aria-label="Verrouillé">
            <LockIcon />
          </span>
        </li>
      </ul>
    </div>
  );
}
