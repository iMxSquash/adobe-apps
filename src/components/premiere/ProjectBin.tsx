import Image from "next/image";

import type { Video } from "@/lib/content";
import { getThumbnailUrl } from "@/lib/youtube";

interface ProjectBinProps {
  videos: Video[];
  activeId: string;
  onSelect: (id: string) => void;
  onPlay: (id: string) => void;
}

export function ProjectBin({ videos, activeId, onSelect, onPlay }: ProjectBinProps) {
  return (
    <div className="text-[11px]">
      <div
        aria-hidden="true"
        className="flex border-b border-border px-2 py-1 uppercase tracking-wide text-text-dim"
      >
        <span className="flex-1">Nom</span>
        <span>Durée</span>
      </div>
      <ul>
        {videos.map((video) => {
          const isActive = video.id === activeId;
          return (
            <li key={video.id}>
              <button
                type="button"
                aria-current={isActive}
                onClick={() => onSelect(video.id)}
                onDoubleClick={() => onPlay(video.id)}
                className={`flex h-9 w-full items-center gap-2 px-2 text-left hover:bg-surface-2 ${
                  isActive ? "bg-accent/30 text-text" : "text-text-dim"
                }`}
              >
                <span className="relative h-9 w-16 shrink-0 bg-surface-2">
                  <Image
                    src={getThumbnailUrl(video.youtube_id, "mqdefault")}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </span>
                <span className="flex-1 truncate">{video.title}</span>
                <span className="tabular-nums">{video.duration ?? "--:--"}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
