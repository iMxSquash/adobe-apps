// Decorative palette: the swatches are not interactive.
const SWATCHES = [
  "#000000",
  "#ffffff",
  "#ff0000",
  "#ff9a00",
  "#ffe600",
  "#00a651",
  "#00aeef",
  "#2e3192",
  "#92278f",
  "#ed1e79",
  "#8c6239",
  "#808080",
];

export function SwatchesPanelContent() {
  return (
    <ul className="grid grid-cols-6 gap-1">
      {SWATCHES.map((color) => (
        <li
          key={color}
          role="img"
          aria-label={color}
          className="aspect-square border border-border"
          style={{ backgroundColor: color }}
        />
      ))}
    </ul>
  );
}
