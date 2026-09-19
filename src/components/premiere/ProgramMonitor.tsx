import Image from "next/image";

import type { Video } from "@/lib/content";
import { formatTimecode } from "@/lib/timecode";
import { getEmbedUrl, getThumbnailUrl } from "@/lib/youtube";

interface ProgramMonitorProps {
  video: Video;
  isPlayerMounted: boolean;
  isPlaying: boolean;
  currentSeconds: number;
  totalSeconds: number;
  onIframeRef: (iframe: HTMLIFrameElement | null) => void;
  onTogglePlay: () => void;
  onStepFrame: (direction: 1 | -1) => void;
}

const CONTROL_CLASS =
  "flex h-7 w-7 items-center justify-center rounded text-text-dim hover:bg-surface-2 hover:text-text disabled:pointer-events-none disabled:opacity-40";

function ControlIcon({ path, size = 14 }: { path: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

const ICON_PATHS = {
  play: "M4 2l10 6-10 6z",
  pause: "M3 2h4v12H3zM9 2h4v12H9z",
  previous: "M11 2v12L4 8zM2 2h2v12H2z",
  next: "M5 2v12l7-6zM12 2h2v12h-2z",
};

export function ProgramMonitor({
  video,
  isPlayerMounted,
  isPlaying,
  currentSeconds,
  totalSeconds,
  onIframeRef,
  onTogglePlay,
  onStepFrame,
}: ProgramMonitorProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-black">
      <div className="flex min-h-0 flex-1 items-center justify-center [container-type:size]">
        <div className="relative aspect-video w-[min(100cqw,calc(100cqh*16/9))]">
          {isPlayerMounted ? (
            <iframe
              key={video.youtube_id}
              ref={onIframeRef}
              src={getEmbedUrl(video.youtube_id, window.location.origin)}
              title={`Moniteur du programme : ${video.title}`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            <button
              type="button"
              aria-label={`Lire ${video.title}`}
              onClick={onTogglePlay}
              className="group absolute inset-0"
            >
              <Image
                src={getThumbnailUrl(video.youtube_id, "hqdefault")}
                alt=""
                fill
                sizes="(min-width: 768px) 60vw, 100vw"
                className="object-cover"
                priority
              />
              <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-accent ring-1 ring-accent group-hover:bg-black/80">
                <ControlIcon path={ICON_PATHS.play} size={20} />
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="flex h-9 shrink-0 items-center justify-between gap-2 border-t border-border bg-surface-1 px-2">
        <span
          className="font-mono text-xs tabular-nums text-accent"
          aria-label="Position de lecture"
        >
          {formatTimecode(currentSeconds)}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Image précédente"
            disabled={!isPlayerMounted}
            onClick={() => onStepFrame(-1)}
            className={CONTROL_CLASS}
          >
            <ControlIcon path={ICON_PATHS.previous} />
          </button>
          <button
            type="button"
            aria-label={isPlaying ? "Pause" : "Lecture"}
            onClick={onTogglePlay}
            className={CONTROL_CLASS}
          >
            <ControlIcon path={isPlaying ? ICON_PATHS.pause : ICON_PATHS.play} />
          </button>
          <button
            type="button"
            aria-label="Image suivante"
            disabled={!isPlayerMounted}
            onClick={() => onStepFrame(1)}
            className={CONTROL_CLASS}
          >
            <ControlIcon path={ICON_PATHS.next} />
          </button>
        </div>
        <span className="font-mono text-xs tabular-nums text-text-dim" aria-label="Durée totale">
          {formatTimecode(totalSeconds)}
        </span>
      </div>
    </div>
  );
}
