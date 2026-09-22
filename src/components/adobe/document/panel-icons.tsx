// Icons for the collapsed panel rail (see PanelGroup) — same 16x16, stroke,
// currentColor convention as Toolbar tool icons (see tools.tsx per app).

import type { ReactNode } from "react";

function PanelIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function LayersPanelIcon() {
  return (
    <PanelIcon>
      <path d="M8 1.5L14.5 5 8 8.5 1.5 5 8 1.5Z" strokeLinejoin="round" />
      <path d="M1.5 8L8 11.5 14.5 8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1.5 11L8 14.5 14.5 11" strokeLinecap="round" strokeLinejoin="round" />
    </PanelIcon>
  );
}

export function CommentsPanelIcon() {
  return (
    <PanelIcon>
      <path d="M2 3h12v7.5H6.5L3 13.5v-3H2V3Z" strokeLinejoin="round" />
    </PanelIcon>
  );
}

export function PropertiesPanelIcon() {
  return (
    <PanelIcon>
      <path d="M1.5 4h4M9 4h5.5M1.5 8h7M12 8h2.5M1.5 12h2M7.5 12h7" strokeLinecap="round" />
      <circle cx="6.5" cy="4" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="8" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </PanelIcon>
  );
}

export function SwatchesPanelIcon() {
  return (
    <PanelIcon>
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="0.5" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="0.5" />
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="0.5" />
      <rect x="9" y="9" width="5.5" height="5.5" rx="0.5" />
    </PanelIcon>
  );
}
