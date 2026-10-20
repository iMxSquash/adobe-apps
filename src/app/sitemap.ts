import type { MetadataRoute } from "next";

import { getRequestApp } from "@/lib/request-app";
import { APP_SEO } from "@/lib/seo";

/** The only indexable page of a host is its workspace; `/admin` is excluded in robots.ts. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const app = await getRequestApp();
  if (!app) return [];
  return [{ url: APP_SEO[app].origin, changeFrequency: "monthly", priority: 1 }];
}
