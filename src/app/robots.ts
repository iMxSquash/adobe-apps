import type { MetadataRoute } from "next";

import { getRequestApp } from "@/lib/request-app";
import { APP_SEO } from "@/lib/seo";

/**
 * One file per host: each subdomain has its own sitemap. AI crawlers are
 * allowed on purpose (being cited by answer engines is a goal). Any other host
 * (preview deployments) stays out of the index.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const app = await getRequestApp();
  if (!app) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: `${APP_SEO[app].origin}/sitemap.xml`,
  };
}
