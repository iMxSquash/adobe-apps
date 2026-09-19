export const MAX_TITLE_LENGTH = 120;
export const MAX_DESCRIPTION_LENGTH = 2000;
/** Postgres error code raised when the unique index on `slug` rejects a row. */
export const UNIQUE_VIOLATION_CODE = "23505";

// Mirrors the CHECK constraint on `videos.duration` (mm:ss, minutes up to 3 digits).
const DURATION_PATTERN = /^[0-9]{1,3}:[0-5][0-9]$/;

export function isValidDuration(value: string): boolean {
  return DURATION_PATTERN.test(value);
}

export function readText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function readPositiveInt(formData: FormData, name: string): number | null {
  const value = Number(readText(formData, name));
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}
