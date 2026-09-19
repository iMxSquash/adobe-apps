const EFFECT_CATEGORIES = [
  "Effets prédéfinis",
  "Effets audio",
  "Transitions audio",
  "Effets vidéo",
  "Transitions vidéo",
];

/** Decorative stand-in for Premiere's Effects panel. */
export function SourcePanel() {
  return (
    <ul className="space-y-1 text-[11px] text-text-dim">
      {EFFECT_CATEGORIES.map((category) => (
        <li key={category} className="truncate">
          <span aria-hidden="true" className="mr-1">
            &#9656;
          </span>
          {category}
        </li>
      ))}
    </ul>
  );
}
