import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/adobe/ThemeProvider";
import { buildAppMetadata } from "@/lib/seo";

export const metadata: Metadata = buildAppMetadata("illustrator");

export default function IllustratorLayout({ children }: { children: ReactNode }) {
  return <ThemeProvider app="illustrator">{children}</ThemeProvider>;
}
