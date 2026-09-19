const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export const INPUT_CLASS = `min-h-11 w-full rounded border border-border bg-surface-0 px-3 py-2 text-sm text-text ${FOCUS}`;
export const PRIMARY_BUTTON_CLASS = `inline-flex min-h-11 items-center justify-center rounded bg-accent px-4 text-sm font-semibold text-black disabled:opacity-50 ${FOCUS}`;
export const SECONDARY_BUTTON_CLASS = `inline-flex min-h-11 min-w-11 items-center justify-center rounded border border-border bg-surface-2 px-3 text-sm text-text hover:bg-surface-1 disabled:opacity-40 ${FOCUS}`;
export const DANGER_BUTTON_CLASS = `inline-flex min-h-11 items-center justify-center rounded bg-red-700 px-4 text-sm font-semibold text-white ${FOCUS}`;
export const LABEL_CLASS = "mb-1 block text-sm font-medium";
export const HINT_CLASS = "mt-1 text-xs text-text-dim";
