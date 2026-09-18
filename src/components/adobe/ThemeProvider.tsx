import type { ReactNode } from "react";

import type { AdobeApp } from "@/lib/adobe-theme";

interface ThemeProviderProps {
  app: AdobeApp;
  children: ReactNode;
}

export function ThemeProvider({ app, children }: ThemeProviderProps) {
  return (
    <div data-app={app} className="flex min-h-0 flex-1 flex-col bg-surface-0 text-text">
      {children}
    </div>
  );
}
