import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/adobe/ThemeProvider";
import { buildAppMetadata } from "@/lib/seo";

export const metadata: Metadata = buildAppMetadata("premierepro");

export default function PremiereProLayout({ children }: { children: ReactNode }) {
  return <ThemeProvider app="premierepro">{children}</ThemeProvider>;
}
