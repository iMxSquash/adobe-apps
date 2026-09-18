"use client";

import { useRef, useState, type ReactNode } from "react";

export interface ToolbarTool {
  id: string;
  label: string;
  icon: ReactNode;
}

interface ToolbarProps {
  tools: ToolbarTool[];
  activeTool: string;
  onSelect: (id: string) => void;
}

const TOOLTIP_DELAY_MS = 500;

function ToolButtons({ tools, activeTool, onSelect }: ToolbarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function handleEnter(id: string) {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setHoveredId(id), TOOLTIP_DELAY_MS);
  }
  function handleLeave() {
    clearTimeout(timerRef.current);
    setHoveredId(null);
  }

  return (
    <>
      {tools.map((tool) => (
        <div key={tool.id} className="relative">
          <button
            type="button"
            aria-label={tool.label}
            aria-pressed={activeTool === tool.id}
            onClick={() => onSelect(tool.id)}
            onMouseEnter={() => handleEnter(tool.id)}
            onMouseLeave={handleLeave}
            className={`flex h-6 w-6 items-center justify-center rounded text-text-dim hover:text-text ${
              activeTool === tool.id ? "bg-surface-2 text-text" : ""
            }`}
          >
            {tool.icon}
          </button>
          {hoveredId === tool.id && (
            <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded border border-border bg-surface-2 px-2 py-1 text-[11px] text-text shadow-lg">
              {tool.label}
            </span>
          )}
        </div>
      ))}
    </>
  );
}

export function Toolbar(props: ToolbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Outils"
        aria-expanded={open}
        className="absolute left-1 top-1 z-40 flex h-7 w-7 items-center justify-center rounded border border-border bg-surface-2 text-text-dim hover:text-text @xl:hidden"
      >
        ⋮
      </button>
      {open && (
        <div className="absolute left-1 top-9 z-40 flex w-9 flex-col items-center gap-1 rounded border border-border bg-surface-1 py-2 shadow-xl @xl:hidden">
          <ToolButtons {...props} />
        </div>
      )}
      <div className="hidden w-9 shrink-0 flex-col items-center gap-1 border-r border-border bg-surface-1 py-2 @xl:flex">
        <ToolButtons {...props} />
      </div>
    </>
  );
}
