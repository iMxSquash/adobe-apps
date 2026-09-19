const YOUTUBE_IFRAME_API_URL = "https://www.youtube.com/iframe_api";

export interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
}

interface YouTubeApi {
  Player: new (
    iframe: HTMLIFrameElement,
    options: { events: { onReady: () => void; onStateChange: (event: { data: number }) => void } },
  ) => YouTubePlayer;
  PlayerState: { PLAYING: number };
}

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YouTubeApi> | null = null;

/** Loads the YouTube IFrame API script once and resolves with its global. */
export function loadYouTubeApi(): Promise<YouTubeApi> {
  apiPromise ??= new Promise((resolve, reject) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }
    window.onYouTubeIframeAPIReady = () => {
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = YOUTUBE_IFRAME_API_URL;
    script.async = true;
    script.onerror = () => {
      apiPromise = null;
      reject(new Error("Failed to load the YouTube IFrame API"));
    };
    document.head.append(script);
  });
  return apiPromise;
}
