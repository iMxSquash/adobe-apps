export const APPS = ["photoshop", "illustrator", "premierepro"] as const;
export type AppId = (typeof APPS)[number];

export const APP_BY_HOST: Record<string, AppId> = {
  "photoshop.elwen.dev": "photoshop",
  "illustrator.elwen.dev": "illustrator",
  "premierepro.elwen.dev": "premierepro",
};

export function appForHost(host: string): AppId | undefined {
  return (
    APP_BY_HOST[host] ??
    (host.match(/^(photoshop|illustrator|premierepro)\.localhost$/)?.[1] as AppId | undefined)
  );
}
