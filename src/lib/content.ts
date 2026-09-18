import { createPublicClient } from "@/lib/supabase-public";

export type ArtworkApp = "photoshop" | "illustrator";

export interface Artwork {
  id: string;
  app: ArtworkApp;
  title: string;
  slug: string;
  image_url: string;
  layer_name: string;
  description: string;
  width: number | null;
  height: number | null;
  sort_order: number;
  visible: boolean;
  created_at: string;
}

export interface Video {
  id: string;
  title: string;
  slug: string;
  youtube_id: string;
  description: string | null;
  duration: string | null;
  sort_order: number;
  visible: boolean;
  created_at: string;
}

export async function getArtworks(app: ArtworkApp): Promise<Artwork[]> {
  const { data, error } = await createPublicClient()
    .from("artworks")
    .select("*")
    .eq("app", app)
    .order("sort_order")
    .overrideTypes<Artwork[], { merge: false }>();
  if (error) throw new Error(`Failed to load ${app} artworks: ${error.message}`);
  return data;
}

export async function getArtworkBySlug(slug: string): Promise<Artwork | null> {
  const { data, error } = await createPublicClient()
    .from("artworks")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<Artwork>();
  if (error) throw new Error(`Failed to load artwork "${slug}": ${error.message}`);
  return data;
}

export async function getVideos(): Promise<Video[]> {
  const { data, error } = await createPublicClient()
    .from("videos")
    .select("*")
    .order("sort_order")
    .overrideTypes<Video[], { merge: false }>();
  if (error) throw new Error(`Failed to load videos: ${error.message}`);
  return data;
}

export async function getVideoBySlug(slug: string): Promise<Video | null> {
  const { data, error } = await createPublicClient()
    .from("videos")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<Video>();
  if (error) throw new Error(`Failed to load video "${slug}": ${error.message}`);
  return data;
}
