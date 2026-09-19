import { notFound } from "next/navigation";

import { ArtworkForm } from "@/components/admin/ArtworkForm";
import { VideoForm } from "@/components/admin/VideoForm";
import { requireAdminPage } from "@/lib/admin/auth";
import { getArtwork, getVideo } from "@/lib/admin/queries";
import { parseSection } from "@/lib/admin/section";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ section: string; id: string }>;
}) {
  const { section: sectionParam, id } = await params;
  const section = parseSection(sectionParam);
  if (!section) notFound();
  const { supabase } = await requireAdminPage();

  if (section === "premierepro") {
    const video = await getVideo(supabase, id);
    if (!video) notFound();
    return <EditLayout title="Modifier la vidéo" form={<VideoForm video={video} />} />;
  }

  const artwork = await getArtwork(supabase, id);
  if (!artwork || artwork.app !== section) notFound();
  return (
    <EditLayout title="Modifier l'œuvre" form={<ArtworkForm app={section} artwork={artwork} />} />
  );
}

function EditLayout({ title, form }: { title: string; form: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-xl font-semibold">{title}</h1>
      {form}
    </main>
  );
}
