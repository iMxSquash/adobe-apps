"use client";

import { useCallback, useEffect, useState } from "react";

import { FRAME_RATE } from "@/lib/timecode";
import { loadYouTubeApi, type YouTubePlayer } from "@/lib/youtube-player";

/** 10 fps is plenty to move a playhead. */
const POLL_INTERVAL_MS = 100;

/** Drives the YouTube player living in `iframe` and mirrors its playback position into React state. */
export function useYouTubePlayer(iframe: HTMLIFrameElement | null) {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (!iframe) return;
    let isCancelled = false;

    loadYouTubeApi()
      .then((youtube) => {
        if (isCancelled) return;
        const instance = new youtube.Player(iframe, {
          events: {
            onReady: () => {
              if (isCancelled) return;
              setDurationSeconds(instance.getDuration() || null);
              setPlayer(instance);
            },
            onStateChange: (event) => {
              if (isCancelled) return;
              setIsPlaying(event.data === youtube.PlayerState.PLAYING);
              setCurrentSeconds(instance.getCurrentTime());
            },
          },
        });
      })
      .catch((error: unknown) => {
        console.warn("YouTube player controls unavailable, monitor stays decorative", error);
      });

    return () => {
      isCancelled = true;
      setPlayer(null);
      setIsPlaying(false);
      setCurrentSeconds(0);
      setDurationSeconds(null);
    };
  }, [iframe]);

  useEffect(() => {
    if (!player || !isPlaying) return;
    let intervalId: number | undefined;

    const sync = () => setCurrentSeconds(player.getCurrentTime());
    const start = () => {
      sync();
      intervalId = window.setInterval(sync, POLL_INTERVAL_MS);
    };
    const handleVisibilityChange = () => {
      window.clearInterval(intervalId);
      if (!document.hidden) start();
    };

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [player, isPlaying]);

  const seekTo = useCallback(
    (seconds: number) => {
      const target = Math.max(0, seconds);
      player?.seekTo(target, true);
      if (player) setCurrentSeconds(target);
    },
    [player],
  );

  const togglePlay = useCallback(() => {
    if (isPlaying) player?.pauseVideo();
    else player?.playVideo();
  }, [player, isPlaying]);

  const stepFrame = useCallback(
    (direction: 1 | -1) => {
      player?.pauseVideo();
      seekTo(currentSeconds + direction / FRAME_RATE);
    },
    [player, seekTo, currentSeconds],
  );

  return {
    isReady: player !== null,
    isPlaying,
    currentSeconds,
    durationSeconds,
    seekTo,
    togglePlay,
    stepFrame,
  };
}
