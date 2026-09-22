"use client";

import { Children, isValidElement, useState, type ReactElement, type ReactNode } from "react";

interface PanelProps {
  title: string;
  defaultCollapsed?: boolean;
  /** Drops the content padding, for panels that manage their own layout edge to edge. */
  flush?: boolean;
  /** Shown instead of the title's initials in the collapsed rail (see PanelGroup). */
  icon?: ReactNode;
  children: ReactNode;
}

export function Panel({ title, defaultCollapsed = false, flush = false, children }: PanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className={`flex min-h-0 flex-col ${collapsed ? "shrink-0" : "flex-1"}`}>
      <button
        type="button"
        onDoubleClick={() => setCollapsed((value) => !value)}
        className="flex h-6 shrink-0 items-center bg-surface-1 px-2 text-left text-[11px] font-medium uppercase tracking-wide text-text-dim hover:text-text"
      >
        {title}
      </button>
      {!collapsed && (
        <div className={`min-h-0 flex-1 overflow-y-auto bg-surface-1 ${flush ? "" : "p-2"}`}>
          {children}
        </div>
      )}
    </div>
  );
}

export function PanelGroup({ children }: { children: ReactNode }) {
  const [openRailIndex, setOpenRailIndex] = useState<number | null>(null);
  const panels = Children.toArray(children).filter(isValidElement) as ReactElement<PanelProps>[];

  return (
    <div className="relative flex w-9 shrink-0 flex-col border-l border-border bg-surface-1 @4xl:w-60">
      <div className="hidden min-h-0 flex-1 flex-col divide-y divide-border overflow-y-auto @4xl:flex">
        {panels}
      </div>

      {/* gap-3 rather than a tighter gap-1: these are touch targets on mobile, spaced out
          to avoid a mis-tap opening the wrong panel. */}
      <div className="flex min-h-0 flex-1 flex-col items-center gap-3 overflow-y-auto py-2 @4xl:hidden">
        {panels.map((panel, index) => (
          <button
            key={panel.props.title}
            type="button"
            aria-label={panel.props.title}
            aria-expanded={openRailIndex === index}
            onClick={() => setOpenRailIndex((current) => (current === index ? null : index))}
            className={`flex h-8 w-8 items-center justify-center rounded text-[10px] font-medium uppercase text-text-dim hover:text-text ${
              openRailIndex === index ? "bg-surface-2 text-text" : ""
            }`}
          >
            {panel.props.icon ?? panel.props.title.slice(0, 2)}
          </button>
        ))}
      </div>

      {openRailIndex !== null && panels[openRailIndex] && (
        <div className="absolute right-9 top-0 z-40 flex h-full w-60 flex-col divide-y divide-border border border-border bg-surface-1 shadow-xl @4xl:hidden">
          {panels[openRailIndex]}
        </div>
      )}
    </div>
  );
}
