import { APP_LABEL, type AdobeApp } from "@/lib/adobe-theme";

export const ADMIN_SECTIONS = Object.keys(APP_LABEL) as AdobeApp[];

export const ADMIN_APP_HEADER = "x-adobe-app";

export function parseSection(value: string | null | undefined): AdobeApp | null {
  return ADMIN_SECTIONS.find((section) => section === value) ?? null;
}
