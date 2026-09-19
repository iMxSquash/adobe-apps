import { describe, expect, it } from "vitest";

import {
  INITIAL_VIEW_STATE,
  MAX_ZOOM,
  MIN_ZOOM,
  clampZoom,
  fitZoom,
  nextZoomStep,
  zoomAtPoint,
} from "./zoom";

describe("clampZoom", () => {
  it("keeps values inside the bounds", () => {
    expect(clampZoom(150)).toBe(150);
  });

  it("clamps values below the minimum and above the maximum", () => {
    expect(clampZoom(1)).toBe(MIN_ZOOM);
    expect(clampZoom(9999)).toBe(MAX_ZOOM);
  });
});

describe("nextZoomStep", () => {
  it("moves to the next step when zooming in", () => {
    expect(nextZoomStep(100, 1)).toBe(150);
  });

  it("moves to the previous step when zooming out", () => {
    expect(nextZoomStep(100, -1)).toBe(66);
  });

  it("snaps to the nearest step from an in-between zoom", () => {
    expect(nextZoomStep(80, 1)).toBe(100);
    expect(nextZoomStep(80, -1)).toBe(66);
  });

  it("stays at the bounds", () => {
    expect(nextZoomStep(MAX_ZOOM, 1)).toBe(MAX_ZOOM);
    expect(nextZoomStep(MIN_ZOOM, -1)).toBe(MIN_ZOOM);
  });
});

describe("fitZoom", () => {
  it("shrinks a large document to fit the viewport with a margin", () => {
    const zoom = fitZoom(1000, 800, 2000, 1000);
    expect(zoom).toBeGreaterThan(MIN_ZOOM);
    expect(zoom).toBeLessThan(50);
  });

  it("never enlarges a small document beyond 100%", () => {
    expect(fitZoom(1000, 800, 100, 100)).toBe(100);
  });

  it("is limited by the tighter dimension", () => {
    expect(fitZoom(1000, 300, 500, 500)).toBeLessThan(fitZoom(1000, 800, 500, 500));
  });

  it("falls back to the minimum when the viewport is not measured yet", () => {
    expect(fitZoom(0, 0, 1200, 800)).toBe(MIN_ZOOM);
  });
});

describe("zoomAtPoint", () => {
  const view = { ...INITIAL_VIEW_STATE, zoom: 100, panX: 40, panY: -20 };

  it("keeps the document point under the cursor fixed", () => {
    const [px, py] = [120, 60];
    const next = zoomAtPoint(view, 200, px, py);

    const documentPointBefore = [(px - view.panX) / 100, (py - view.panY) / 100];
    const documentPointAfter = [(px - next.panX) / 200, (py - next.panY) / 200];
    expect(documentPointAfter[0]).toBeCloseTo(documentPointBefore[0]);
    expect(documentPointAfter[1]).toBeCloseTo(documentPointBefore[1]);
  });

  it("scales the pan when zooming around the viewport center", () => {
    const next = zoomAtPoint(view, 200, 0, 0);
    expect(next).toMatchObject({ zoom: 200, panX: 80, panY: -40 });
  });

  it("treats an unset zoom as 100%", () => {
    const next = zoomAtPoint({ ...view, zoom: null }, 200, 0, 0);
    expect(next.panX).toBe(80);
  });

  it("does not mutate the previous state", () => {
    zoomAtPoint(view, 200, 10, 10);
    expect(view).toMatchObject({ zoom: 100, panX: 40, panY: -20 });
  });
});
