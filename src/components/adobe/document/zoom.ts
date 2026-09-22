export const MIN_ZOOM = 10;
export const MAX_ZOOM = 400;
export const DEFAULT_ZOOM = 100;
const ZOOM_STEPS = [10, 25, 33, 50, 66, 100, 150, 200, 300, 400];
const FIT_MARGIN_PX = 48;

/** Per-document view state, kept alive while the tab stays open. `zoom: null` means "fit not computed yet". */
export interface DocumentViewState {
  zoom: number | null;
  panX: number;
  panY: number;
  hiddenLayerIds: string[];
}

export const INITIAL_VIEW_STATE: DocumentViewState = {
  zoom: null,
  panX: 0,
  panY: 0,
  hiddenLayerIds: [],
};

export function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

export function nextZoomStep(zoom: number, direction: 1 | -1): number {
  const step =
    direction === 1
      ? ZOOM_STEPS.find((value) => value > zoom)
      : ZOOM_STEPS.findLast((value) => value < zoom);
  return step ?? clampZoom(zoom);
}

/** Largest zoom (capped at 100 %) showing the whole document with a margin. */
export function fitZoom(viewW: number, viewH: number, docW: number, docH: number): number {
  const ratio = Math.min((viewW - FIT_MARGIN_PX) / docW, (viewH - FIT_MARGIN_PX) / docH);
  return clampZoom(Math.min(ratio * 100, DEFAULT_ZOOM));
}

/**
 * Zooms while keeping the document point under (px, py) fixed on screen.
 * px/py are relative to the viewport center, which is the transform origin.
 */
export function zoomAtPoint(
  state: DocumentViewState,
  nextZoom: number,
  px: number,
  py: number,
): DocumentViewState {
  const ratio = nextZoom / (state.zoom ?? DEFAULT_ZOOM);
  return {
    ...state,
    zoom: nextZoom,
    panX: px - (px - state.panX) * ratio,
    panY: py - (py - state.panY) * ratio,
  };
}

/**
 * Two-finger pinch: scales by `distanceRatio` (new finger distance / previous finger
 * distance) anchored on the pinch midpoint before this move, then applies the
 * midpoint's own drift (`midDeltaX`/`midDeltaY`) as a plain pan so the gesture also
 * tracks a simultaneous two-finger drag. All coordinates are viewport-center-relative,
 * like `zoomAtPoint`.
 */
export function pinchZoom(
  state: DocumentViewState,
  distanceRatio: number,
  previousMidX: number,
  previousMidY: number,
  midDeltaX: number,
  midDeltaY: number,
): DocumentViewState {
  const zoomed = zoomAtPoint(
    state,
    clampZoom((state.zoom ?? DEFAULT_ZOOM) * distanceRatio),
    previousMidX,
    previousMidY,
  );
  return { ...zoomed, panX: zoomed.panX + midDeltaX, panY: zoomed.panY + midDeltaY };
}
