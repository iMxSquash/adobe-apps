"use client";

import { useEffect, useRef, type PointerEvent } from "react";

import { formatTimecode } from "@/lib/timecode";

const PIXELS_PER_SECOND = 10;
const RULER_INTERVAL_SECONDS = 10;
/** Empty space kept after the clip so the end of the sequence is visible. */
const TRAILING_SECONDS = 30;
/** Distance kept between the playhead and the left edge when the view scrolls to follow it. */
const FOLLOW_MARGIN_PX = 48;
const TRACK_HEADER_CLASS =
  "flex h-6 items-center justify-center border-b border-border text-[10px]";

interface TimelineProps {
  title: string;
  clipSeconds: number;
  currentSeconds: number;
  /** Undefined while the player is not driveable: the ruler is then inert. */
  onSeek?: (seconds: number) => void;
}

export function Timeline({ title, clipSeconds, currentSeconds, onSeek }: TimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentWidth = (clipSeconds + TRAILING_SECONDS) * PIXELS_PER_SECOND;
  const clipWidth = clipSeconds * PIXELS_PER_SECOND;
  const playheadX = currentSeconds * PIXELS_PER_SECOND;
  const rulerMarks = Array.from(
    { length: Math.ceil(contentWidth / PIXELS_PER_SECOND / RULER_INTERVAL_SECONDS) },
    (_, index) => index * RULER_INTERVAL_SECONDS,
  );

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const isOutOfView =
      playheadX < scroller.scrollLeft || playheadX > scroller.scrollLeft + scroller.clientWidth;
    if (isOutOfView) scroller.scrollLeft = Math.max(0, playheadX - FOLLOW_MARGIN_PX);
  }, [playheadX]);

  function seekFromPointer(event: PointerEvent<HTMLDivElement>) {
    if (!onSeek) return;
    const { left } = event.currentTarget.getBoundingClientRect();
    const seconds = (event.clientX - left) / PIXELS_PER_SECOND;
    onSeek(Math.min(clipSeconds, Math.max(0, seconds)));
  }

  return (
    <div className="flex h-full min-h-0 text-text-dim">
      <div className="w-10 shrink-0 border-r border-border bg-surface-1">
        <div className="h-5 border-b border-border" />
        <div className={TRACK_HEADER_CLASS}>V1</div>
        <div className={TRACK_HEADER_CLASS}>A1</div>
      </div>

      <div ref={scrollRef} className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden">
        <div className="relative" style={{ width: contentWidth }}>
          {/* Pointer-only scrubbing: keyboard users get frame stepping from the monitor controls. */}
          <div
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              seekFromPointer(event);
            }}
            onPointerMove={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) seekFromPointer(event);
            }}
            className={`relative h-5 select-none border-b border-border bg-surface-1 ${
              onSeek ? "cursor-pointer" : ""
            }`}
          >
            {rulerMarks.map((seconds) => (
              <span
                key={seconds}
                className="absolute bottom-0 top-0 border-l border-text-dim/40 pl-1 font-mono text-[9px] leading-5"
                style={{ left: seconds * PIXELS_PER_SECOND }}
              >
                {formatTimecode(seconds).slice(3, 8)}
              </span>
            ))}
          </div>

          <div className="relative h-6 border-b border-border">
            <div
              className="absolute inset-y-0.5 left-0 truncate rounded-sm bg-gradient-to-r from-accent/80 to-accent/50 px-2 text-[10px] leading-5 text-black"
              style={{ width: clipWidth }}
            >
              {title}
            </div>
          </div>

          <div className="relative h-6 border-b border-border">
            <div
              className="absolute inset-y-0.5 left-0 overflow-hidden rounded-sm bg-emerald-700/60"
              style={{ width: clipWidth }}
            >
              <svg width="100%" height="100%" aria-hidden="true">
                <defs>
                  <pattern id="waveform" width="24" height="20" patternUnits="userSpaceOnUse">
                    <path
                      d="M1 10v0M4 6v8M7 3v14M10 7v6M13 4v12M16 8v4M19 5v10M22 9v2"
                      stroke="currentColor"
                      className="text-emerald-300"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#waveform)" />
              </svg>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 z-10 w-px bg-sky-400"
            style={{ left: playheadX }}
          >
            <span className="absolute -left-[5px] top-0 h-3 w-[11px] bg-sky-400 [clip-path:polygon(0_0,100%_0,100%_60%,50%_100%,0_60%)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
