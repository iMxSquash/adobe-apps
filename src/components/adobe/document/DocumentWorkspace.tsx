"use client";

import { useCallback, useState } from "react";

import { AppShell } from "@/components/adobe/AppShell";
import { FileTabs } from "@/components/adobe/FileTabs";
import { HomeScreen } from "@/components/adobe/HomeScreen";
import { Panel, PanelGroup } from "@/components/adobe/PanelGroup";
import { StatusBar } from "@/components/adobe/StatusBar";
import { Toolbar, type ToolbarTool } from "@/components/adobe/Toolbar";
import { CLOSE_ITEM_LABEL, FILE_MENU_LABEL, type AdobeMenu } from "@/lib/adobe-menus";
import type { Artwork } from "@/lib/content";

import { CommentsPanelContent } from "./CommentsPanel";
import { FILE_EXTENSION, type DocumentVariant } from "./constants";
import { DocumentCanvas } from "./DocumentCanvas";
import { LayersPanelContent } from "./LayersPanel";
import { PropertiesPanelContent } from "./PropertiesPanel";
import {
  DEFAULT_ZOOM,
  INITIAL_VIEW_STATE,
  nextZoomStep,
  zoomAtPoint,
  type DocumentViewState,
} from "./zoom";

interface DocumentWorkspaceProps {
  appLabel: string;
  variant: DocumentVariant;
  menus: AdobeMenu[];
  tools: ToolbarTool[];
  artworks: Artwork[];
}

export function DocumentWorkspace({
  appLabel,
  variant,
  menus,
  tools,
  artworks,
}: DocumentWorkspaceProps) {
  const getFileName = (artwork: Artwork) => `${artwork.title}${FILE_EXTENSION[variant]}`;
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [views, setViews] = useState<Record<string, DocumentViewState>>({});
  const [activeTool, setActiveTool] = useState(tools[0]?.id ?? "");

  const openArtworks = openIds.flatMap((id) => artworks.find((a) => a.id === id) ?? []);
  const activeArtwork = openArtworks.find((a) => a.id === activeId) ?? null;
  const activeView = activeArtwork ? (views[activeArtwork.id] ?? INITIAL_VIEW_STATE) : null;

  const updateView = useCallback(
    (id: string, update: (view: DocumentViewState) => DocumentViewState) =>
      setViews((current) => ({ ...current, [id]: update(current[id] ?? INITIAL_VIEW_STATE) })),
    [],
  );

  function openDocument(id: string) {
    setOpenIds((current) => (current.includes(id) ? current : [...current, id]));
    setActiveId(id);
  }

  function closeDocument(id: string) {
    const index = openIds.indexOf(id);
    const remaining = openIds.filter((openId) => openId !== id);
    setOpenIds(remaining);
    setViews((current) =>
      Object.fromEntries(Object.entries(current).filter(([key]) => key !== id)),
    );
    if (id === activeId) setActiveId(remaining[Math.min(index, remaining.length - 1)] ?? null);
  }

  function stepZoom(direction: 1 | -1) {
    if (!activeArtwork || !activeView) return;
    const next = nextZoomStep(activeView.zoom ?? DEFAULT_ZOOM, direction);
    updateView(activeArtwork.id, (view) => zoomAtPoint(view, next, 0, 0));
  }

  function handleMenuCommand(menuLabel: string, itemLabel: string) {
    if (menuLabel === FILE_MENU_LABEL && itemLabel === CLOSE_ITEM_LABEL && activeId) {
      closeDocument(activeId);
    }
  }

  if (!activeArtwork || !activeView) {
    return (
      <AppShell appLabel={appLabel} menus={menus} onMenuCommand={handleMenuCommand}>
        <HomeScreen
          appLabel={appLabel}
          items={artworks.map((artwork) => ({
            id: artwork.id,
            title: getFileName(artwork),
            subtitle: artwork.layer_name,
            href: `/${artwork.slug}`,
            thumbnailUrl: artwork.image_url,
          }))}
          emptyMessage="Aucune œuvre pour le moment."
          onOpen={openDocument}
        />
      </AppShell>
    );
  }

  const panels = (
    <PanelGroup>
      <Panel title="Calques">
        <LayersPanelContent
          artwork={activeArtwork}
          isLayerVisible={activeView.isLayerVisible}
          onToggleVisibility={() =>
            updateView(activeArtwork.id, (view) => ({
              ...view,
              isLayerVisible: !view.isLayerVisible,
            }))
          }
        />
      </Panel>
      <Panel title="Commentaires">
        <CommentsPanelContent artwork={activeArtwork} />
      </Panel>
      <Panel title="Propriétés">
        <PropertiesPanelContent artwork={activeArtwork} />
      </Panel>
    </PanelGroup>
  );

  return (
    <AppShell
      appLabel={appLabel}
      menus={menus}
      onMenuCommand={handleMenuCommand}
      toolbar={<Toolbar tools={tools} activeTool={activeTool} onSelect={setActiveTool} />}
      fileTabs={
        <FileTabs
          tabs={openArtworks.map((a) => ({ id: a.id, label: getFileName(a) }))}
          activeId={activeArtwork.id}
          onSelect={setActiveId}
          onClose={closeDocument}
        />
      }
      panels={panels}
      statusBar={
        <StatusBar
          zoom={activeView.zoom ?? DEFAULT_ZOOM}
          width={activeArtwork.width ?? undefined}
          height={activeArtwork.height ?? undefined}
          onZoomIn={() => stepZoom(1)}
          onZoomOut={() => stepZoom(-1)}
        />
      }
    >
      <div className="flex h-full min-h-0 flex-col">
        <p className="shrink-0 truncate bg-surface-1 px-3 py-1 text-[11px] text-text-dim">
          {getFileName(activeArtwork)} @ {Math.round(activeView.zoom ?? DEFAULT_ZOOM)} % (Calque :{" "}
          {activeArtwork.layer_name})
        </p>
        <div className="min-h-0 flex-1">
          {openArtworks.map((artwork) => (
            <DocumentCanvas
              key={artwork.id}
              artwork={artwork}
              view={views[artwork.id] ?? INITIAL_VIEW_STATE}
              isActive={artwork.id === activeArtwork.id}
              onViewChange={updateView}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
