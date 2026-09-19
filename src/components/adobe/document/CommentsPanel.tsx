import type { Artwork } from "@/lib/content";

import { CommentCard } from "./CommentCard";

export function CommentsPanelContent({ artwork }: { artwork: Artwork }) {
  return (
    <div className="flex flex-col gap-3">
      <CommentCard artwork={artwork} />
      <input
        type="text"
        disabled
        aria-label="Répondre au commentaire"
        placeholder="Répondre"
        className="rounded border border-border bg-surface-0 px-2 py-1 text-[11px] text-text-dim placeholder:text-text-dim"
      />
    </div>
  );
}
