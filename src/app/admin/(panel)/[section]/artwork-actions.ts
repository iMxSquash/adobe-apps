"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { requireAdminAction } from "@/lib/admin/auth";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  UNIQUE_VIOLATION_CODE,
  readPositiveInt,
  readText,
} from "@/lib/admin/fields";
import {
  ARTWORKS_BUCKET,
  IMAGE_EXTENSION_BY_MIME,
  IMAGE_SNIFF_BYTES,
  MAX_IMAGE_BYTES,
  detectImageMime,
  extensionOf,
  isImageMime,
  isValidUploadPath,
  storagePathFromUrl,
} from "@/lib/admin/image";
import {
  getArtwork,
  listSiblingLayerNames,
  listTakenSlugs,
  nextSortOrder,
} from "@/lib/admin/queries";
import { slugify, uniqueSlug } from "@/lib/admin/slug";
import type { ArtworkApp } from "@/lib/content";
import { revalidateApp } from "@/lib/revalidate";

export interface FormState {
  error?: string;
}

export type UploadUrlResult = { error: string } | { path: string; token: string };

function isArtworkApp(value: string): value is ArtworkApp {
  return value === "photoshop" || value === "illustrator";
}

/** Step 1 of an upload: the browser then sends the file straight to Storage (bypasses the serverless body limit). */
export async function createArtworkUploadUrl(input: {
  title: string;
  mime: string;
  size: number;
}): Promise<UploadUrlResult> {
  const { supabase } = await requireAdminAction();

  if (!isImageMime(input.mime)) return { error: "Format refusé : PNG, JPEG, WebP ou AVIF." };
  if (!Number.isFinite(input.size) || input.size <= 0 || input.size > MAX_IMAGE_BYTES) {
    return { error: "Image trop lourde (10 Mo maximum)." };
  }

  const extension = IMAGE_EXTENSION_BY_MIME[input.mime];
  const path = `${slugify(input.title)}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
  const { data, error } = await supabase.storage.from(ARTWORKS_BUCKET).createSignedUploadUrl(path);
  if (error) return { error: "Impossible de préparer l'envoi de l'image." };
  return { path, token: data.token };
}

// The declared MIME type is client-controlled: check the real bytes of what landed in the bucket.
async function isUploadedImageValid(supabase: SupabaseClient, path: string): Promise<boolean> {
  if (!isValidUploadPath(path)) return false;
  const { data } = supabase.storage.from(ARTWORKS_BUCKET).getPublicUrl(path);
  const response = await fetch(data.publicUrl, {
    headers: { Range: `bytes=0-${IMAGE_SNIFF_BYTES - 1}` },
    cache: "no-store",
  });
  if (!response.ok) return false;
  const bytes = new Uint8Array(await response.arrayBuffer()).slice(0, IMAGE_SNIFF_BYTES);
  const mime = detectImageMime(bytes);
  return mime !== null && IMAGE_EXTENSION_BY_MIME[mime] === extensionOf(path);
}

async function removeFromBucket(supabase: SupabaseClient, path: string): Promise<void> {
  const { error } = await supabase.storage.from(ARTWORKS_BUCKET).remove([path]);
  if (error) console.warn(`Orphan file left in bucket: ${path} (${error.message})`);
}

export async function saveArtwork(
  appParam: string,
  id: string | null,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireAdminAction();
  if (!isArtworkApp(appParam)) return { error: "Application inconnue." };
  const app = appParam;

  const title = readText(formData, "title");
  const requestedLayerName = readText(formData, "layer_name");
  const description = readText(formData, "description");
  const requestedSlug = readText(formData, "slug");
  const visible = formData.get("visible") === "on";
  const newImagePath = readText(formData, "image_path");
  const width = readPositiveInt(formData, "width");
  const height = readPositiveInt(formData, "height");

  if (!title || title.length > MAX_TITLE_LENGTH)
    return { error: `Titre requis (${MAX_TITLE_LENGTH} caractères max).` };
  if (!requestedLayerName || requestedLayerName.length > MAX_TITLE_LENGTH) {
    return { error: `Nom du calque requis (${MAX_TITLE_LENGTH} caractères max).` };
  }
  if (!description || description.length > MAX_DESCRIPTION_LENGTH) {
    return { error: `Description requise (${MAX_DESCRIPTION_LENGTH} caractères max).` };
  }

  const existing = id ? await getArtwork(supabase, id) : null;
  if (id && (!existing || existing.app !== app)) return { error: "Œuvre introuvable." };
  if (!existing && !newImagePath) return { error: "Une image est requise." };

  if (newImagePath && !(await isUploadedImageValid(supabase, newImagePath))) {
    if (isValidUploadPath(newImagePath)) await removeFromBucket(supabase, newImagePath);
    return { error: "Le fichier envoyé n'est pas une image valide." };
  }

  // Artworks sharing a title are layers of one file: a repeated layer name gets a suffix.
  const siblingLayerNames = await listSiblingLayerNames(supabase, app, title, id);
  const layerName = uniqueSlug(requestedLayerName, new Set(siblingLayerNames));

  // Every row needs its own slug: derive it from the layer when the file already has one.
  const defaultSlugSource = siblingLayerNames.length > 0 ? `${title} ${layerName}` : title;
  const baseSlug = slugify(requestedSlug || defaultSlugSource);
  const taken = await listTakenSlugs(supabase, "artworks", baseSlug, id);
  if (requestedSlug && taken.has(baseSlug)) {
    if (newImagePath) await removeFromBucket(supabase, newImagePath);
    return { error: `Le slug "${baseSlug}" est déjà utilisé.` };
  }
  const slug = uniqueSlug(baseSlug, taken);

  const fields = {
    title,
    slug,
    layer_name: layerName,
    description,
    visible,
    ...(newImagePath && {
      image_url: supabase.storage.from(ARTWORKS_BUCKET).getPublicUrl(newImagePath).data.publicUrl,
      width,
      height,
    }),
  };

  const { error } = existing
    ? await supabase.from("artworks").update(fields).eq("id", existing.id)
    : await supabase
        .from("artworks")
        .insert({ ...fields, app, sort_order: await nextSortOrder(supabase, "artworks", app) });

  if (error) {
    if (newImagePath) await removeFromBucket(supabase, newImagePath);
    return {
      error:
        error.code === UNIQUE_VIOLATION_CODE
          ? `Le slug "${slug}" est déjà utilisé.`
          : "L'enregistrement a échoué.",
    };
  }

  const replacedPath = newImagePath && existing ? storagePathFromUrl(existing.image_url) : null;
  if (replacedPath) await removeFromBucket(supabase, replacedPath);

  revalidateApp(app, ...(existing ? [existing.slug, slug] : [slug]));
  redirect(`/admin/${app}`);
}
