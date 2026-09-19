import { revalidatePath } from "next/cache";
import type { ArtworkApp } from "@/lib/content";

// Paths are the internal routes: the proxy rewrites `<app>.elwen.dev/x` to `/<app>/x`.
export function revalidateApp(app: ArtworkApp | "premierepro", ...slugs: string[]): void {
  revalidatePath(`/${app}`);
  for (const slug of slugs) revalidatePath(`/${app}/${slug}`);
}
