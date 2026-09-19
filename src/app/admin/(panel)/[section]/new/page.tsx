import { notFound } from "next/navigation";

import { ArtworkForm } from "@/components/admin/ArtworkForm";
import { VideoForm } from "@/components/admin/VideoForm";
import { requireAdminPage } from "@/lib/admin/auth";
import { parseSection } from "@/lib/admin/section";

export default async function NewItemPage({ params }: { params: Promise<{ section: string }> }) {
  const section = parseSection((await params).section);
  if (!section) notFound();
  await requireAdminPage();

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-xl font-semibold">
        {section === "premierepro" ? "Ajouter une vidéo" : "Ajouter une œuvre"}
      </h1>
      {section === "premierepro" ? (
        <VideoForm video={null} />
      ) : (
        <ArtworkForm app={section} artwork={null} />
      )}
    </main>
  );
}
