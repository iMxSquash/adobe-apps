"use client";

import { useCallback, useMemo, useState } from "react";

import { AppShell } from "@/components/adobe/AppShell";
import { FileTabs } from "@/components/adobe/FileTabs";
import { HomeScreen } from "@/components/adobe/HomeScreen";
import { Panel, PanelGroup } from "@/components/adobe/PanelGroup";
import { StatusBar } from "@/components/adobe/StatusBar";
import { Toolbar, type ToolbarTool } from "@/components/adobe/Toolbar";
import { CLOSE_ITEM_LABEL, FILE_MENU_LABEL, type AdobeMenu } from "@/lib/adobe-menus";
import type { Artwork } from "@/lib/content";
import { documentBase, groupArtworksIntoDocuments, type ArtworkDocument } from "@/lib/documents";

import { CommentsPanelContent } from "./CommentsPanel";
import { FILE_EXTENSION, type DocumentVariant } from "./constants";
import { DocumentCanvas } from "./DocumentCanvas";
import { LayersPanelContent } from "./LayersPanel";
import {
  CommentsPanelIcon,
  LayersPanelIcon,
  PropertiesPanelIcon,
  SwatchesPanelIcon,
} from "./panel-icons";
import { PropertiesPanelContent } from "./PropertiesPanel";
import { SwatchesPanelContent } from "./SwatchesPanel";
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
  const documents = useMemo(() => groupArtworksIntoDocuments(artworks), [artworks]);
  const getFileName = (file: ArtworkDocument) => `${file.title}${FILE_EXTENSION[variant]}`;
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [views, setViews] = useState<Record<string, DocumentViewState>>({});
  const [activeTool, setActiveTool] = useState(tools[0]?.id ?? "");

  const openFiles = openIds.flatMap((id) => documents.find((file) => file.id === id) ?? []);
  const activeFile = openFiles.find((file) => file.id === activeId) ?? null;
  const activeView = activeFile ? (views[activeFile.id] ?? INITIAL_VIEW_STATE) : null;

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
    if (!activeFile || !activeView) return;
    const next = nextZoomStep(activeView.zoom ?? DEFAULT_ZOOM, direction);
    updateView(activeFile.id, (view) => zoomAtPoint(view, next, 0, 0));
  }

  function handleMenuCommand(menuLabel: string, itemLabel: string) {
    if (menuLabel === FILE_MENU_LABEL && itemLabel === CLOSE_ITEM_LABEL && activeId) {
      closeDocument(activeId);
    }
  }

  if (!activeFile || !activeView) {
    return (
      <AppShell appLabel={appLabel} menus={menus} onMenuCommand={handleMenuCommand}>
        <HomeScreen
          appLabel={appLabel}
          items={documents.map((file) => {
            const base = documentBase(file);
            return {
              id: file.id,
              title: getFileName(file),
              subtitle: file.layers.length > 1 ? `${file.layers.length} calques` : base.layer_name,
              href: `/${base.slug}`,
              thumbnailUrl: base.image_url,
            };
          })}
          emptyMessage="Aucune œuvre pour le moment."
          onOpen={openDocument}
        />
      </AppShell>
    );
  }

  const panels = (
    <PanelGroup>
      <Panel title="Calques" icon={<LayersPanelIcon />}>
        <LayersPanelContent
          file={activeFile}
          hiddenLayerIds={activeView.hiddenLayerIds}
          onToggleVisibility={(layerId) =>
            updateView(activeFile.id, (view) => ({
              ...view,
              hiddenLayerIds: view.hiddenLayerIds.includes(layerId)
                ? view.hiddenLayerIds.filter((id) => id !== layerId)
                : [...view.hiddenLayerIds, layerId],
            }))
          }
        />
      </Panel>
      <Panel title="Commentaires" icon={<CommentsPanelIcon />}>
        <CommentsPanelContent artwork={documentBase(activeFile)} />
      </Panel>
      {variant === "illustrator" ? (
        <Panel title="Nuancier" icon={<SwatchesPanelIcon />}>
          <SwatchesPanelContent />
        </Panel>
      ) : (
        <Panel title="Propriétés" icon={<PropertiesPanelIcon />}>
          <PropertiesPanelContent file={activeFile} />
        </Panel>
      )}
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
          tabs={openFiles.map((file) => ({ id: file.id, label: getFileName(file) }))}
          activeId={activeFile.id}
          onSelect={setActiveId}
          onClose={closeDocument}
        />
      }
      panels={panels}
      statusBar={
        <StatusBar
          zoom={activeView.zoom ?? DEFAULT_ZOOM}
          width={documentBase(activeFile).width ?? undefined}
          height={documentBase(activeFile).height ?? undefined}
          onZoomIn={() => stepZoom(1)}
          onZoomOut={() => stepZoom(-1)}
        />
      }
    >
      <div className="flex h-full min-h-0 flex-col">
        <p className="shrink-0 truncate bg-surface-1 px-3 py-1 text-[11px] text-text-dim">
          {getFileName(activeFile)} @ {Math.round(activeView.zoom ?? DEFAULT_ZOOM)} % (Calque :{" "}
          {activeFile.layers.at(-1)?.layer_name})
        </p>
        <div className="min-h-0 flex-1">
          {openFiles.map((file) => (
            <DocumentCanvas
              key={file.id}
              file={file}
              variant={variant}
              view={views[file.id] ?? INITIAL_VIEW_STATE}
              isActive={file.id === activeFile.id}
              onViewChange={updateView}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
