import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/adobe/ThemeProvider";

export default function PhotoshopLayout({ children }: { children: ReactNode }) {
  return <ThemeProvider app="photoshop">{children}</ThemeProvider>;
}
