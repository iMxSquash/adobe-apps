import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/adobe/ThemeProvider";
import { buildAppMetadata } from "@/lib/seo";

export const metadata: Metadata = buildAppMetadata("photoshop");

export default function PhotoshopLayout({ children }: { children: ReactNode }) {
  return <ThemeProvider app="photoshop">{children}</ThemeProvider>;
}
