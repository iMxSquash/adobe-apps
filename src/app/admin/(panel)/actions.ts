"use server";

import { redirect } from "next/navigation";

import { ADMIN_LOGIN_PATH, requireAdminAction } from "@/lib/admin/auth";
import { ARTWORKS_BUCKET, storagePathFromUrl } from "@/lib/admin/image";
import { parseSection } from "@/lib/admin/section";
import { tableFor } from "@/lib/admin/queries";
import type { AdobeApp } from "@/lib/adobe-theme";
import { revalidateApp } from "@/lib/revalidate";

function assertSection(value: string): AdobeApp {
  const section = parseSection(value);
  if (!section) throw new Error(`Unknown admin section: "${value}"`);
  return section;
}

export async function logout(): Promise<void> {
  const { supabase } = await requireAdminAction();
  await supabase.auth.signOut();
  redirect(ADMIN_LOGIN_PATH);
}

export async function toggleVisible(sectionParam: string, id: string): Promise<void> {
  const section = assertSection(sectionParam);
  const { supabase } = await requireAdminAction();
  const table = tableFor(section);

  const { data, error } = await supabase
    .from(table)
    .select("visible, slug")
    .eq("id", id)
    .single<{ visible: boolean; slug: string }>();
  if (error) throw new Error(`Failed to read ${table}/${id}: ${error.message}`);

  const { error: updateError } = await supabase
    .from(table)
    .update({ visible: !data.visible })
    .eq("id", id);
  if (updateError) throw new Error(`Failed to toggle ${table}/${id}: ${updateError.message}`);

  revalidateApp(section, data.slug);
}

export async function moveItem(
  sectionParam: string,
  id: string,
  direction: "up" | "down",
): Promise<void> {
  const section = assertSection(sectionParam);
  const { supabase } = await requireAdminAction();
  const table = tableFor(section);

  let query = supabase.from(table).select("id, slug");
  if (table === "artworks") query = query.eq("app", section);
  const { data, error } = await query
    .order("sort_order")
    .order("created_at")
    .overrideTypes<{ id: string; slug: string }[], { merge: false }>();
  if (error) throw new Error(`Failed to list ${table}: ${error.message}`);

  const from = data.findIndex((row) => row.id === id);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from === -1 || to < 0 || to >= data.length) return;

  const reordered = [...data];
  [reordered[from], reordered[to]] = [reordered[to], reordered[from]];

  // Rewriting every rank (not swapping two) also repairs rows sharing the default sort_order 0.
  const results = await Promise.all(
    reordered.map((row, index) =>
      supabase.from(table).update({ sort_order: index }).eq("id", row.id),
    ),
  );
  const failed = results.find((result) => result.error);
  if (failed?.error) throw new Error(`Failed to reorder ${table}: ${failed.error.message}`);

  revalidateApp(section);
}

export async function deleteItem(sectionParam: string, id: string): Promise<void> {
  const section = assertSection(sectionParam);
  const { supabase } = await requireAdminAction();
  const table = tableFor(section);

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .single<{ slug: string; image_url?: string }>();
  if (error) throw new Error(`Failed to read ${table}/${id}: ${error.message}`);

  const { error: deleteError } = await supabase.from(table).delete().eq("id", id);
  if (deleteError) throw new Error(`Failed to delete ${table}/${id}: ${deleteError.message}`);

  // Row first: a failure here leaves an orphan file, never a row pointing at a missing image.
  const path = data.image_url ? storagePathFromUrl(data.image_url) : null;
  if (path) {
    const { error: removeError } = await supabase.storage.from(ARTWORKS_BUCKET).remove([path]);
    if (removeError) console.warn(`Orphan file left in bucket: ${path} (${removeError.message})`);
  }

  revalidateApp(section, data.slug);
  redirect(`/admin/${section}`);
}
