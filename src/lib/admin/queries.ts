import type { SupabaseClient } from "@supabase/supabase-js";

import type { AdobeApp } from "@/lib/adobe-theme";
import type { Artwork, ArtworkApp, Video } from "@/lib/content";

export type AdminTable = "artworks" | "videos";

export function tableFor(section: AdobeApp): AdminTable {
  return section === "premierepro" ? "videos" : "artworks";
}

// These reads run with the admin session, so RLS also returns hidden rows.
export async function listArtworks(supabase: SupabaseClient, app: ArtworkApp): Promise<Artwork[]> {
  const { data, error } = await supabase
    .from("artworks")
    .select("*")
    .eq("app", app)
    .order("sort_order")
    .overrideTypes<Artwork[], { merge: false }>();
  if (error) throw new Error(`Failed to list ${app} artworks: ${error.message}`);
  return data;
}

export async function listVideos(supabase: SupabaseClient): Promise<Video[]> {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .order("sort_order")
    .overrideTypes<Video[], { merge: false }>();
  if (error) throw new Error(`Failed to list videos: ${error.message}`);
  return data;
}

export async function getArtwork(supabase: SupabaseClient, id: string): Promise<Artwork | null> {
  const { data, error } = await supabase
    .from("artworks")
    .select("*")
    .eq("id", id)
    .maybeSingle<Artwork>();
  if (error) throw new Error(`Failed to load artwork "${id}": ${error.message}`);
  return data;
}

export async function getVideo(supabase: SupabaseClient, id: string): Promise<Video | null> {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("id", id)
    .maybeSingle<Video>();
  if (error) throw new Error(`Failed to load video "${id}": ${error.message}`);
  return data;
}

/** Slugs already used by other rows, to detect conflicts before the unique index does. */
export async function listTakenSlugs(
  supabase: SupabaseClient,
  table: AdminTable,
  base: string,
  excludeId: string | null,
): Promise<Set<string>> {
  let query = supabase.from(table).select("slug").like("slug", `${base}%`);
  if (excludeId) query = query.neq("id", excludeId);
  const { data, error } = await query.overrideTypes<{ slug: string }[], { merge: false }>();
  if (error) throw new Error(`Failed to check slugs in ${table}: ${error.message}`);
  return new Set(data.map((row) => row.slug));
}

export async function nextSortOrder(
  supabase: SupabaseClient,
  table: AdminTable,
  app: ArtworkApp | null,
): Promise<number> {
  let query = supabase.from(table).select("sort_order");
  if (app) query = query.eq("app", app);
  const { data, error } = await query
    .order("sort_order", { ascending: false })
    .limit(1)
    .overrideTypes<{ sort_order: number }[], { merge: false }>();
  if (error) throw new Error(`Failed to read sort order in ${table}: ${error.message}`);
  return (data[0]?.sort_order ?? -1) + 1;
}
