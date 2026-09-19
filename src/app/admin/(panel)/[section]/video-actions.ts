"use server";

import { redirect } from "next/navigation";

import { requireAdminAction } from "@/lib/admin/auth";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  UNIQUE_VIOLATION_CODE,
  isValidDuration,
  readText,
} from "@/lib/admin/fields";
import { getVideo, listTakenSlugs, nextSortOrder } from "@/lib/admin/queries";
import { slugify, uniqueSlug } from "@/lib/admin/slug";
import { revalidateApp } from "@/lib/revalidate";
import { extractYoutubeId } from "@/lib/youtube";

import type { FormState } from "./artwork-actions";

export type YoutubeMetaResult = { error: string } | { youtubeId: string; title: string };

const OEMBED_TIMEOUT_MS = 5000;
const UNRECOGNIZED_URL = "URL YouTube non reconnue (watch, youtu.be, shorts ou embed).";

/** Title lookup via oEmbed (no API key). Runs server-side and rebuilds the URL from the extracted id: no SSRF. */
export async function fetchYoutubeMeta(url: string): Promise<YoutubeMetaResult> {
  await requireAdminAction();

  const youtubeId = extractYoutubeId(url);
  if (!youtubeId) return { error: UNRECOGNIZED_URL };

  const oembed = new URL("https://www.youtube.com/oembed");
  oembed.searchParams.set("url", `https://youtu.be/${youtubeId}`);
  oembed.searchParams.set("format", "json");

  let response: Response;
  try {
    response = await fetch(oembed, { signal: AbortSignal.timeout(OEMBED_TIMEOUT_MS) });
  } catch (error) {
    console.warn(`YouTube oEmbed unreachable for ${youtubeId}:`, error);
    return { error: "YouTube ne répond pas, réessaie dans un instant." };
  }
  if (response.status === 401 || response.status === 403 || response.status === 404) {
    return { error: "Vidéo privée, supprimée ou introuvable." };
  }
  if (!response.ok) return { error: "YouTube a refusé la requête." };

  const body: unknown = await response.json();
  const title =
    typeof body === "object" && body !== null && "title" in body && typeof body.title === "string"
      ? body.title
      : "";
  return { youtubeId, title };
}

export async function saveVideo(
  id: string | null,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireAdminAction();

  const youtubeId = extractYoutubeId(readText(formData, "youtube_url"));
  const title = readText(formData, "title");
  const description = readText(formData, "description");
  const duration = readText(formData, "duration");
  const requestedSlug = readText(formData, "slug");
  const visible = formData.get("visible") === "on";

  if (!youtubeId) return { error: UNRECOGNIZED_URL };
  if (!title || title.length > MAX_TITLE_LENGTH)
    return { error: `Titre requis (${MAX_TITLE_LENGTH} caractères max).` };
  if (description.length > MAX_DESCRIPTION_LENGTH) return { error: "Description trop longue." };
  if (duration && !isValidDuration(duration)) return { error: "Durée au format mm:ss." };

  const existing = id ? await getVideo(supabase, id) : null;
  if (id && !existing) return { error: "Vidéo introuvable." };

  const baseSlug = slugify(requestedSlug || title);
  const taken = await listTakenSlugs(supabase, "videos", baseSlug, id);
  if (requestedSlug && taken.has(baseSlug))
    return { error: `Le slug "${baseSlug}" est déjà utilisé.` };
  const slug = uniqueSlug(baseSlug, taken);

  const fields = {
    title,
    slug,
    youtube_id: youtubeId,
    description: description || null,
    duration: duration || null,
    visible,
  };

  const { error } = existing
    ? await supabase.from("videos").update(fields).eq("id", existing.id)
    : await supabase
        .from("videos")
        .insert({ ...fields, sort_order: await nextSortOrder(supabase, "videos", null) });

  if (error) {
    return {
      error:
        error.code === UNIQUE_VIOLATION_CODE
          ? `Le slug "${slug}" est déjà utilisé.`
          : "L'enregistrement a échoué.",
    };
  }

  revalidateApp("premierepro", ...(existing ? [existing.slug, slug] : [slug]));
  redirect("/admin/premierepro");
}
