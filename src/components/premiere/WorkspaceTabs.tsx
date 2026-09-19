"use client";

import { useState } from "react";

const WORKSPACES = ["Montage", "Couleur", "Audio", "Effets"];

/** Decorative: switching workspace changes nothing but the highlighted tab. */
export function WorkspaceTabs() {
  const [active, setActive] = useState(WORKSPACES[0]);

  return (
    <div className="flex h-7 shrink-0 items-stretch overflow-x-auto border-b border-border bg-surface-1 px-1 text-xs">
      {WORKSPACES.map((workspace) => (
        <button
          key={workspace}
          type="button"
          aria-pressed={workspace === active}
          onClick={() => setActive(workspace)}
          className={`shrink-0 px-3 ${
            workspace === active
              ? "border-b-2 border-b-accent text-text"
              : "text-text-dim hover:text-text"
          }`}
        >
          {workspace}
        </button>
      ))}
    </div>
  );
}
