import type { Artwork } from "@/lib/content";

export function PropertiesPanelContent({ artwork }: { artwork: Artwork }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
      <dt className="text-text-dim">Document</dt>
      <dd className="truncate text-text">{artwork.title}</dd>
      {artwork.width != null && artwork.height != null && (
        <>
          <dt className="text-text-dim">Dimensions</dt>
          <dd className="text-text">
            {artwork.width} × {artwork.height} px
          </dd>
        </>
      )}
      <dt className="text-text-dim">Calque</dt>
      <dd className="truncate text-text">{artwork.layer_name}</dd>
    </dl>
  );
}
