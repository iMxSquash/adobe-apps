"use client";

import Image from "next/image";
import { memo, useCallback, useEffect, useRef, useState, type PointerEvent } from "react";

import { documentBase, type ArtworkDocument } from "@/lib/documents";

import { CommentCard } from "./CommentCard";
import { ARTBOARD_LABEL, COMMENT_PIN_POSITION, type DocumentVariant } from "./constants";
import { clampZoom, DEFAULT_ZOOM, fitZoom, zoomAtPoint, type DocumentViewState } from "./zoom";

// Transparency checkerboard: 8px squares.
const CHECKERBOARD_STYLE = {
  backgroundImage: "repeating-conic-gradient(#ffffff 0% 25%, #cccccc 0% 50%)",
  backgroundSize: "16px 16px",
};
const WHEEL_ZOOM_SENSITIVITY = 0.01;
const PIXELATED_ABOVE_ZOOM = 200;
const FALLBACK_DOCUMENT_SIZE = { width: 1200, height: 800 };

// Illustrator work area: grey surface around a white artboard.
const WORK_AREA_CLASS = "bg-[#4b4b4b]";
const ARTBOARD_STYLE = { backgroundColor: "#ffffff" };

interface DocumentCanvasProps {
  file: ArtworkDocument;
  variant: DocumentVariant;
  view: DocumentViewState;
  isActive: boolean;
  onViewChange: (id: string, update: (view: DocumentViewState) => DocumentViewState) => void;
}

export const DocumentCanvas = memo(function DocumentCanvas({
  file,
  variant,
  view,
  isActive,
  onViewChange,
}: DocumentCanvasProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [isCommentOpen, setIsCommentOpen] = useState(false);

  const base = documentBase(file);
  const docWidth = base.width ?? FALLBACK_DOCUMENT_SIZE.width;
  const docHeight = base.height ?? FALLBACK_DOCUMENT_SIZE.height;
  const zoom = view.zoom ?? fitZoom(viewportSize.width, viewportSize.height, docWidth, docHeight);
  const { id } = file;
  const isArtboard = variant === "illustrator";

  const panBy = useCallback(
    (dx: number, dy: number) =>
      onViewChange(id, (current) => ({
        ...current,
        panX: current.panX + dx,
        panY: current.panY + dy,
      })),
    [id, onViewChange],
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(([entry]) =>
      setViewportSize({ width: entry.contentRect.width, height: entry.contentRect.height }),
    );
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  // Hidden tabs measure 0x0: the initial fit is computed once the tab is actually visible.
  useEffect(() => {
    if (!isActive || view.zoom !== null || viewportSize.width === 0) return;
    onViewChange(id, (current) => ({ ...current, zoom }));
  }, [isActive, view.zoom, viewportSize.width, zoom, id, onViewChange]);

  // Native listener: React registers wheel handlers as passive, which forbids preventDefault.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      if (!event.ctrlKey && !event.metaKey) {
        panBy(-event.deltaX, -event.deltaY);
        return;
      }
      const rect = viewport!.getBoundingClientRect();
      const px = event.clientX - rect.left - rect.width / 2;
      const py = event.clientY - rect.top - rect.height / 2;
      const factor = Math.exp(-event.deltaY * WHEEL_ZOOM_SENSITIVITY);
      onViewChange(id, (current) =>
        zoomAtPoint(current, clampZoom((current.zoom ?? DEFAULT_ZOOM) * factor), px, py),
      );
    }

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, [id, onViewChange, panBy]);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    setIsCommentOpen(false);
    lastPointerRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const last = lastPointerRef.current;
    if (!last) return;
    lastPointerRef.current = { x: event.clientX, y: event.clientY };
    panBy(event.clientX - last.x, event.clientY - last.y);
  }

  function handlePointerEnd() {
    lastPointerRef.current = null;
  }

  return (
    <div
      ref={viewportRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      className={`relative h-full w-full cursor-grab touch-none overflow-hidden active:cursor-grabbing ${
        isArtboard ? WORK_AREA_CLASS : "bg-surface-0"
      } ${isActive ? "" : "hidden"}`}
    >
      <div
        className="absolute left-1/2 top-1/2 will-change-transform shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
        style={{
          width: docWidth,
          height: docHeight,
          transform: `translate(${view.panX}px, ${view.panY}px) translate(-50%, -50%) scale(${zoom / 100})`,
          ...(isArtboard ? ARTBOARD_STYLE : CHECKERBOARD_STYLE),
        }}
      >
        {isArtboard && (
          <span
            className="absolute bottom-full left-0 mb-1 whitespace-nowrap text-[10px] text-text-dim"
            style={{ transform: `scale(${100 / zoom})`, transformOrigin: "bottom left" }}
          >
            {ARTBOARD_LABEL}
          </span>
        )}
        {file.layers.map((layer) => (
          <Image
            key={layer.id}
            src={layer.image_url}
            alt={layer.layer_name}
            width={docWidth}
            height={docHeight}
            draggable={false}
            // Served as-is: resizing would blur the pixels Photoshop shows at high zoom.
            unoptimized
            // Hidden rather than unmounted: toggling the eye must not re-decode the image.
            className={`pointer-events-none absolute inset-0 block h-full w-full select-none object-contain ${
              view.hiddenLayerIds.includes(layer.id) ? "invisible" : ""
            }`}
            style={zoom > PIXELATED_ABOVE_ZOOM ? { imageRendering: "pixelated" } : undefined}
          />
        ))}

        {/* The pin lives inside the transformed container but is counter-scaled to keep a constant size. */}
        <div
          className="absolute"
          style={{
            left: `${COMMENT_PIN_POSITION.x}%`,
            top: `${COMMENT_PIN_POSITION.y}%`,
            transform: `scale(${100 / zoom})`,
            transformOrigin: "top left",
          }}
        >
          <button
            type="button"
            aria-label="Commentaire"
            aria-expanded={isCommentOpen}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => setIsCommentOpen((open) => !open)}
            className="comment-pin relative flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full rounded-bl-none bg-accent text-xs font-medium text-surface-0 shadow-md"
          >
            1
          </button>
          {isCommentOpen && (
            <div
              onPointerDown={(event) => event.stopPropagation()}
              className="absolute right-3 top-4 z-10 w-56 cursor-default rounded border border-border bg-surface-1 p-3 shadow-xl"
            >
              <CommentCard artwork={base} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
