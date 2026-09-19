const UNITS: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
  { unit: "year", seconds: 31_536_000 },
  { unit: "month", seconds: 2_592_000 },
  { unit: "day", seconds: 86_400 },
  { unit: "hour", seconds: 3_600 },
  { unit: "minute", seconds: 60 },
];

const formatter = new Intl.RelativeTimeFormat("fr", { numeric: "auto", style: "short" });

/** French short relative date ("il y a 3 j") from an ISO timestamp. */
export function formatRelativeDate(iso: string, now: number = Date.now()): string {
  const elapsedSeconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  const match = UNITS.find(({ seconds }) => elapsedSeconds >= seconds);
  if (!match) return formatter.format(0, "second");
  return formatter.format(-Math.floor(elapsedSeconds / match.seconds), match.unit);
}
