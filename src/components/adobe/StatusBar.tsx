interface StatusBarProps {
  zoom: number;
  width?: number;
  height?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

const ZOOM_BUTTON_CLASS =
  "flex h-5 w-5 items-center justify-center rounded hover:bg-surface-2 hover:text-text";

export function StatusBar({ zoom, width, height, onZoomIn, onZoomOut }: StatusBarProps) {
  return (
    <>
      {/* Grouped so the parent status bar can push it to one end and the dimensions
          to the other (see AppShell's max-sm:justify-between) instead of every
          element floating independently in the flex row. */}
      <span className="flex items-center gap-3">
        {onZoomOut && (
          <button
            type="button"
            aria-label="Zoom arrière"
            onClick={onZoomOut}
            className={ZOOM_BUTTON_CLASS}
          >
            -
          </button>
        )}
        <span>{Math.round(zoom)}%</span>
        {onZoomIn && (
          <button
            type="button"
            aria-label="Zoom avant"
            onClick={onZoomIn}
            className={ZOOM_BUTTON_CLASS}
          >
            +
          </button>
        )}
      </span>
      {width != null && height != null && (
        <span>
          {width} x {height} px
        </span>
      )}
    </>
  );
}
