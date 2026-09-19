import type { SupabaseClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DeleteButton } from "@/components/admin/DeleteButton";
import { PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from "@/components/admin/styles";
import { requireAdminPage } from "@/lib/admin/auth";
import { listArtworks, listVideos } from "@/lib/admin/queries";
import { parseSection } from "@/lib/admin/section";
import { APP_LABEL, type AdobeApp } from "@/lib/adobe-theme";
import { getThumbnailUrl } from "@/lib/youtube";

import { deleteItem, moveItem, toggleVisible } from "../actions";

interface ListRow {
  id: string;
  title: string;
  slug: string;
  visible: boolean;
  thumbnailUrl: string;
  detail: string;
}

const THUMBNAIL_WIDTH = 96;
const THUMBNAIL_HEIGHT = 54;

async function loadRows(section: AdobeApp, supabase: SupabaseClient): Promise<ListRow[]> {
  if (section === "premierepro") {
    return (await listVideos(supabase)).map((video) => ({
      id: video.id,
      title: video.title,
      slug: video.slug,
      visible: video.visible,
      thumbnailUrl: getThumbnailUrl(video.youtube_id, "mqdefault"),
      detail: video.duration ?? "durée non renseignée",
    }));
  }
  const extension = section === "photoshop" ? "psd" : "ai";
  return (await listArtworks(supabase, section)).map((artwork) => ({
    id: artwork.id,
    title: artwork.title,
    slug: artwork.slug,
    visible: artwork.visible,
    thumbnailUrl: artwork.image_url,
    detail: `${artwork.title}.${extension}`,
  }));
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const section = parseSection((await params).section);
  if (!section) notFound();
  const { supabase } = await requireAdminPage();
  const rows = await loadRows(section, supabase);

  const isVideos = section === "premierepro";
  const deleteConsequences = isVideos
    ? "La vidéo disparaîtra de Premiere Pro."
    : "L'œuvre et son fichier image dans le stockage seront supprimés.";

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">
          {APP_LABEL[section]} : {isVideos ? "vidéos" : "œuvres"}
        </h1>
        <Link href={`/admin/${section}/new`} className={PRIMARY_BUTTON_CLASS}>
          {isVideos ? "Ajouter une vidéo" : "Ajouter une œuvre"}
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-text-dim">Rien pour l&apos;instant.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((row, index) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center gap-3 rounded border border-border bg-surface-1 p-3"
            >
              <Image
                src={row.thumbnailUrl}
                alt=""
                width={THUMBNAIL_WIDTH}
                height={THUMBNAIL_HEIGHT}
                className="h-[54px] w-24 rounded object-cover"
              />
              <div className="min-w-0 flex-1 basis-40">
                <p className="truncate font-medium">{row.title}</p>
                <p className="truncate text-xs text-text-dim">
                  {row.detail} · /{row.slug}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <form action={moveItem.bind(null, section, row.id, "up")}>
                  <button
                    type="submit"
                    disabled={index === 0}
                    aria-label={`Monter « ${row.title} »`}
                    className={SECONDARY_BUTTON_CLASS}
                  >
                    ↑
                  </button>
                </form>
                <form action={moveItem.bind(null, section, row.id, "down")}>
                  <button
                    type="submit"
                    disabled={index === rows.length - 1}
                    aria-label={`Descendre « ${row.title} »`}
                    className={SECONDARY_BUTTON_CLASS}
                  >
                    ↓
                  </button>
                </form>
                <form action={toggleVisible.bind(null, section, row.id)}>
                  <button
                    type="submit"
                    aria-pressed={row.visible}
                    aria-label={`Visibilité de « ${row.title} »`}
                    className={SECONDARY_BUTTON_CLASS}
                  >
                    {row.visible ? "Visible" : "Masquée"}
                  </button>
                </form>
                <Link href={`/admin/${section}/${row.id}`} className={SECONDARY_BUTTON_CLASS}>
                  Modifier
                </Link>
                <DeleteButton
                  itemTitle={row.title}
                  consequences={deleteConsequences}
                  action={deleteItem.bind(null, section, row.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
