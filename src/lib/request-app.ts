import { headers } from "next/headers";

import { type AppId, appForHost } from "@/lib/app-host";

/** App served for the current request's host, or `undefined` (preview deployments, bare localhost). */
export async function getRequestApp(): Promise<AppId | undefined> {
  const host = (await headers()).get("host")?.split(":")[0] ?? "";
  return appForHost(host);
}
