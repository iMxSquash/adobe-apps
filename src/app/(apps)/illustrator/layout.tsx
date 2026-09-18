import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/adobe/ThemeProvider";

export default function IllustratorLayout({ children }: { children: ReactNode }) {
  return <ThemeProvider app="illustrator">{children}</ThemeProvider>;
}
