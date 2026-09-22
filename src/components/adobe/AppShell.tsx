"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import type { AdobeMenu } from "@/lib/adobe-menus";

import { usePortfolioMenuBridge } from "./usePortfolioMenuBridge";

interface AppShellProps {
  appLabel: string;
  menus: AdobeMenu[];
  /** Appelé quand un item de menu est cliqué dans la barre de menu du portfolio (app embarquée uniquement). */
  onMenuCommand?: (menuLabel: string, itemLabel: string) => void;
  fileTabs?: ReactNode;
  toolbar?: ReactNode;
  panels?: ReactNode;
  statusBar?: ReactNode;
  children: ReactNode;
}

export function AppShell({
  appLabel,
  menus,
  onMenuCommand,
  fileTabs,
  toolbar,
  panels,
  statusBar,
  children,
}: AppShellProps) {
  const isEmbedded = usePortfolioMenuBridge(menus, onMenuCommand);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  // Distinct du survol (qui ne fait que suivre le curseur entre menus déjà ouverts) :
  // seul un clic sur le menu qu'on a nous-mêmes ouvert doit le refermer.
  const clickedMenuRef = useRef<string | null>(null);

  function handleMenuClick(label: string) {
    if (clickedMenuRef.current === label && openMenu === label) {
      clickedMenuRef.current = null;
      setOpenMenu(null);
    } else {
      clickedMenuRef.current = label;
      setOpenMenu(label);
    }
  }

  useEffect(() => {
    if (!openMenu) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        clickedMenuRef.current = null;
        setOpenMenu(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        clickedMenuRef.current = null;
        setOpenMenu(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenu]);

  return (
    <div
      ref={rootRef}
      // Embedded + mobile only: the portfolio's own iOS status bar already sits above the
      // iframe, but a little extra breathing room reads better than content touching the very
      // top edge. The padding is on this bg-surface-0-backed box (see ThemeProvider), so the
      // gap keeps the app's background color instead of showing through to blank/white.
      className={`flex h-full min-h-0 flex-1 flex-col overflow-hidden ${
        isEmbedded ? "pt-3 sm:pt-0" : ""
      }`}
    >
      {!isEmbedded && (
        <div className="flex h-7 shrink-0 items-center gap-0.5 border-b border-border bg-surface-1 px-2 text-xs sm:gap-1 text-text-dim">
          <span className="mr-1 whitespace-nowrap font-medium text-text sm:mr-2">{appLabel}</span>
          {menus.map((menu) => (
            <div key={menu.label} className="relative">
              <button
                type="button"
                onClick={() => handleMenuClick(menu.label)}
                onMouseEnter={() => setOpenMenu((current) => (current ? menu.label : current))}
                className={`rounded px-1.5 py-1 hover:bg-surface-2 sm:px-2 hover:text-text ${
                  openMenu === menu.label ? "bg-surface-2 text-text" : ""
                }`}
              >
                {menu.label}
              </button>
              {openMenu === menu.label && (
                <div className="absolute left-0 top-full z-50 min-w-40 rounded-b border border-border bg-surface-2 py-1 shadow-lg">
                  {menu.items.map((item, index) =>
                    item === "-" ? (
                      <div key={index} className="my-1 border-t border-border" />
                    ) : (
                      <div
                        key={index}
                        className="px-3 py-1 text-xs text-text-dim hover:bg-surface-1 hover:text-text"
                      >
                        {item}
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="@container relative flex min-h-0 flex-1">
        {toolbar}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {fileTabs}
          <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        </div>
        {panels}
      </div>

      {/* max-sm (real phone width) rather than the shell's @container breakpoints: this split
          only makes sense once there's no room to keep zoom and dimensions together, which
          happens well below the portfolio window ever gets narrowed to. */}
      <div className="flex h-6 shrink-0 items-center justify-end gap-3 border-t border-border bg-surface-1 px-2 text-[11px] text-text-dim max-sm:justify-between">
        {statusBar}
      </div>
    </div>
  );
}
