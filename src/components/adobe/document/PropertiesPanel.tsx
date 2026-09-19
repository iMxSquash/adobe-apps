import { documentBase, type ArtworkDocument } from "@/lib/documents";

export function PropertiesPanelContent({ file }: { file: ArtworkDocument }) {
  const base = documentBase(file);
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
      <dt className="text-text-dim">Document</dt>
      <dd className="truncate text-text">{file.title}</dd>
      {base.width != null && base.height != null && (
        <>
          <dt className="text-text-dim">Dimensions</dt>
          <dd className="text-text">
            {base.width} × {base.height} px
          </dd>
        </>
      )}
      <dt className="text-text-dim">Calques</dt>
      <dd className="text-text">{file.layers.length}</dd>
    </dl>
  );
}
