import type { AdobeApp } from "@/lib/adobe-theme";

export const COMMENT_AUTHOR = "Elwen";
/** Comment pin position, as a percentage of the document. */
export const COMMENT_PIN_POSITION = { x: 92, y: 8 };

export type DocumentVariant = Exclude<AdobeApp, "premierepro">;
export const FILE_EXTENSION: Record<DocumentVariant, string> = {
  photoshop: ".psd",
  illustrator: ".ai",
};
export const ARTBOARD_LABEL = "Plan de travail 1";
