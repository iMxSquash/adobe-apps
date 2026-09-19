import { ARTWORKS_BUCKET, MAX_IMAGE_BYTES, isImageMime } from "@/lib/admin/image";
import { createPublicClient } from "@/lib/supabase-public";

import { createArtworkUploadUrl } from "@/app/admin/(panel)/[section]/artwork-actions";

export interface ImageDimensions {
  width: number;
  height: number;
}

/** Client-side pre-check for instant feedback; the server re-validates everything. */
export function validateImageFile(file: File): string | null {
  if (!isImageMime(file.type)) return "Format refusé : PNG, JPEG, WebP ou AVIF.";
  if (file.size > MAX_IMAGE_BYTES) return "Image trop lourde (10 Mo maximum).";
  return null;
}

export async function readImageDimensions(file: File): Promise<ImageDimensions> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  bitmap.close();
  return { width, height };
}

/** Sends the file straight to Storage through a one-shot signed URL issued by the server. */
export async function uploadArtworkImage(file: File, title: string): Promise<string> {
  const upload = await createArtworkUploadUrl({ title, mime: file.type, size: file.size });
  if ("error" in upload) throw new Error(upload.error);

  const { error } = await createPublicClient()
    .storage.from(ARTWORKS_BUCKET)
    .uploadToSignedUrl(upload.path, upload.token, file, { contentType: file.type });
  if (error) throw new Error("L'envoi de l'image a échoué.");
  return upload.path;
}
