import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/adobe/ThemeProvider";

export default function PremiereProLayout({ children }: { children: ReactNode }) {
  return <ThemeProvider app="premierepro">{children}</ThemeProvider>;
}
