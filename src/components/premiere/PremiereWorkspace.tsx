"use client";

import { useState } from "react";

import { AppShell } from "@/components/adobe/AppShell";
import { HomeScreen } from "@/components/adobe/HomeScreen";
import { Panel } from "@/components/adobe/PanelGroup";
import { CLOSE_ITEM_LABEL, FILE_MENU_LABEL, type AdobeMenu } from "@/lib/adobe-menus";
import type { Video } from "@/lib/content";
import { durationToSeconds } from "@/lib/timecode";
import { getThumbnailUrl } from "@/lib/youtube";

import { ProgramMonitor } from "./ProgramMonitor";
import { ProjectBin } from "./ProjectBin";
import { SourcePanel } from "./SourcePanel";
import { Timeline } from "./Timeline";
import { useYouTubePlayer } from "./useYouTubePlayer";
import { WorkspaceTabs } from "./WorkspaceTabs";

/** Timeline length used when neither the database nor the player knows the video duration. */
const FALLBACK_CLIP_SECONDS = 60;
const ZONE_CLASS = "flex min-h-0 min-w-0 flex-col";

interface PremiereWorkspaceProps {
  appLabel: string;
  menus: AdobeMenu[];
  videos: Video[];
}

export function PremiereWorkspace({ appLabel, menus, videos }: PremiereWorkspaceProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPlayerMounted, setIsPlayerMounted] = useState(false);
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);
  const player = useYouTubePlayer(iframe);

  const activeVideo = videos.find((video) => video.id === activeId) ?? null;

  function selectSequence(id: string) {
    if (id === activeId) return;
    setActiveId(id);
    setIsPlayerMounted(false);
  }

  function playSequence(id: string) {
    setActiveId(id);
    setIsPlayerMounted(true);
  }

  function togglePlay() {
    if (isPlayerMounted) player.togglePlay();
    else setIsPlayerMounted(true);
  }

  function handleMenuCommand(menuLabel: string, itemLabel: string) {
    if (menuLabel === FILE_MENU_LABEL && itemLabel === CLOSE_ITEM_LABEL) {
      setActiveId(null);
      setIsPlayerMounted(false);
    }
  }

  if (!activeVideo) {
    return (
      <AppShell appLabel={appLabel} menus={menus} onMenuCommand={handleMenuCommand}>
        <HomeScreen
          appLabel={appLabel}
          items={videos.map((video) => ({
            id: video.id,
            title: video.title,
            subtitle: video.duration ?? undefined,
            href: `/${video.slug}`,
            thumbnailUrl: getThumbnailUrl(video.youtube_id, "mqdefault"),
          }))}
          emptyMessage="Aucune vidéo pour le moment."
          onOpen={selectSequence}
        />
      </AppShell>
    );
  }

  // The player knows the real length; the stored text is typed by hand and only covers the wait before it is ready.
  const clipSeconds =
    player.durationSeconds ?? durationToSeconds(activeVideo.duration) ?? FALLBACK_CLIP_SECONDS;

  return (
    <AppShell appLabel={appLabel} menus={menus} onMenuCommand={handleMenuCommand}>
      <div className="@container h-full">
        <div className="flex h-full flex-col">
          <WorkspaceTabs />
          {/* Stacked (monitor, timeline, bin) below ~700px, 2x2 grid above; the source panel only exists in the grid. */}
          <div className="flex min-h-0 flex-1 flex-col gap-px overflow-y-auto bg-border @2xl:grid @2xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] @2xl:grid-rows-[minmax(0,55fr)_minmax(0,45fr)] @2xl:overflow-hidden">
            <div
              className={`${ZONE_CLASS} h-72 shrink-0 @2xl:col-start-2 @2xl:row-start-1 @2xl:h-auto`}
            >
              <Panel title="Moniteur du programme" flush>
                <ProgramMonitor
                  video={activeVideo}
                  isPlayerMounted={isPlayerMounted}
                  isPlaying={player.isPlaying}
                  currentSeconds={player.currentSeconds}
                  totalSeconds={clipSeconds}
                  onIframeRef={setIframe}
                  onTogglePlay={togglePlay}
                  onStepFrame={player.stepFrame}
                />
              </Panel>
            </div>
            <div
              className={`${ZONE_CLASS} h-40 shrink-0 @2xl:col-start-2 @2xl:row-start-2 @2xl:h-auto`}
            >
              <Panel title="Chronologie" flush>
                <Timeline
                  title={activeVideo.title}
                  clipSeconds={clipSeconds}
                  currentSeconds={player.currentSeconds}
                  onSeek={player.isReady ? player.seekTo : undefined}
                />
              </Panel>
            </div>
            <div
              className={`${ZONE_CLASS} h-56 shrink-0 @2xl:col-start-1 @2xl:row-start-2 @2xl:h-auto`}
            >
              <Panel title="Projet" flush>
                <ProjectBin
                  videos={videos}
                  activeId={activeVideo.id}
                  onSelect={selectSequence}
                  onPlay={playSequence}
                />
              </Panel>
            </div>
            <div className={`${ZONE_CLASS} hidden @2xl:col-start-1 @2xl:row-start-1 @2xl:flex`}>
              <Panel title="Effets">
                <SourcePanel />
              </Panel>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
