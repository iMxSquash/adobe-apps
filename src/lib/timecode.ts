/** Frame rate of the fake sequences: YouTube exposes none, so frame stepping and timecodes assume this one. */
export const FRAME_RATE = 25;

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const DURATION_PATTERN = /^(?:(\d+):)?([0-5]?\d):([0-5]\d)$/;

/** Parses the `mm:ss` (or `h:mm:ss`) text stored in `videos.duration`. */
export function durationToSeconds(duration: string | null): number | null {
  const match = duration?.trim().match(DURATION_PATTERN);
  if (!match) return null;
  const [, hours = "0", minutes, seconds] = match;
  return Number(hours) * SECONDS_PER_HOUR + Number(minutes) * SECONDS_PER_MINUTE + Number(seconds);
}

/** Formats seconds as a Premiere timecode: `HH:MM:SS:FF`. */
export function formatTimecode(totalSeconds: number, frameRate = FRAME_RATE): string {
  const totalFrames = Math.floor(Math.max(0, totalSeconds) * frameRate);
  const frames = totalFrames % frameRate;
  const wholeSeconds = Math.floor(totalFrames / frameRate);
  const parts = [
    Math.floor(wholeSeconds / SECONDS_PER_HOUR),
    Math.floor((wholeSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
    wholeSeconds % SECONDS_PER_MINUTE,
    frames,
  ];
  return parts.map((part) => String(part).padStart(2, "0")).join(":");
}
