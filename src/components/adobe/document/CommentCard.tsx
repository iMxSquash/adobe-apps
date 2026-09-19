import type { Artwork } from "@/lib/content";

import { COMMENT_AUTHOR } from "./constants";
import { formatRelativeDate } from "./relative-date";

export function CommentCard({ artwork }: { artwork: Artwork }) {
  return (
    <div className="flex gap-2 text-[11px]">
      <span
        aria-hidden="true"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent font-medium text-surface-0"
      >
        {COMMENT_AUTHOR.charAt(0)}
      </span>
      <div className="min-w-0">
        <p className="text-text">
          <span className="font-medium">{COMMENT_AUTHOR}</span>{" "}
          <span className="text-text-dim">{formatRelativeDate(artwork.created_at)}</span>
        </p>
        <p className="mt-1 whitespace-pre-line break-words text-text">{artwork.description}</p>
      </div>
    </div>
  );
}
