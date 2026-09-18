"use client";

export interface FileTab {
  id: string;
  label: string;
}

interface FileTabsProps {
  tabs: FileTab[];
  activeId: string;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}

export function FileTabs({ tabs, activeId, onSelect, onClose }: FileTabsProps) {
  if (tabs.length === 0) return null;

  return (
    <div className="flex h-8 shrink-0 items-stretch overflow-x-auto border-b border-border bg-surface-1">
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <div
            key={tab.id}
            className={`flex shrink-0 items-center gap-1 border-r border-border pl-3 pr-1 text-xs ${
              active
                ? "border-b-2 border-b-accent bg-surface-0 text-text"
                : "text-text-dim hover:text-text"
            }`}
          >
            <button
              type="button"
              onClick={() => onSelect(tab.id)}
              className="whitespace-nowrap py-1"
            >
              {tab.label}
            </button>
            <button
              type="button"
              aria-label={`Fermer ${tab.label}`}
              onClick={() => onClose(tab.id)}
              className="rounded px-1 text-text-dim hover:bg-surface-2 hover:text-text"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
