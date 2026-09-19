"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";

import type { FormState } from "@/app/admin/(panel)/[section]/artwork-actions";
import { fetchYoutubeMeta, saveVideo } from "@/app/admin/(panel)/[section]/video-actions";
import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH } from "@/lib/admin/fields";
import type { Video } from "@/lib/content";
import { extractYoutubeId } from "@/lib/youtube";

import {
  HINT_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON_CLASS,
  SECONDARY_BUTTON_CLASS,
} from "./styles";
import { YoutubePreview } from "./YoutubePreview";

const INITIAL_STATE: FormState = {};

export function VideoForm({ video }: { video: Video | null }) {
  const [state, formAction, isSaving] = useActionState(
    saveVideo.bind(null, video?.id ?? null),
    INITIAL_STATE,
  );
  const [url, setUrl] = useState(video ? `https://youtu.be/${video.youtube_id}` : "");
  const [title, setTitle] = useState(video?.title ?? "");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isLookingUp, startLookup] = useTransition();

  const youtubeId = extractYoutubeId(url);

  function lookUpTitle() {
    setLookupError(null);
    startLookup(async () => {
      const result = await fetchYoutubeMeta(url);
      if ("error" in result) {
        setLookupError(result.error);
        return;
      }
      setTitle(result.title);
    });
  }

  const error = lookupError ?? state.error;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label htmlFor="youtube_url" className={LABEL_CLASS}>
          URL YouTube
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id="youtube_url"
            name="youtube_url"
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            className={`${INPUT_CLASS} flex-1 basis-64`}
          />
          <button
            type="button"
            onClick={lookUpTitle}
            disabled={!youtubeId || isLookingUp}
            className={SECONDARY_BUTTON_CLASS}
          >
            {isLookingUp ? "Recherche…" : "Récupérer le titre"}
          </button>
        </div>
        <p className={HINT_CLASS}>Formats acceptés : watch, youtu.be, shorts, embed.</p>
        {youtubeId && (
          <div className="mt-3">
            <YoutubePreview youtubeId={youtubeId} />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="title" className={LABEL_CLASS}>
          Titre (nom de la séquence)
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={MAX_TITLE_LENGTH}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label htmlFor="slug" className={LABEL_CLASS}>
          Slug (URL)
        </label>
        <input id="slug" name="slug" defaultValue={video?.slug} className={INPUT_CLASS} />
        <p className={HINT_CLASS}>Laisser vide pour le générer depuis le titre.</p>
      </div>

      <div>
        <label htmlFor="duration" className={LABEL_CLASS}>
          Durée (mm:ss)
        </label>
        <input
          id="duration"
          name="duration"
          inputMode="numeric"
          pattern="[0-9]{1,3}:[0-5][0-9]"
          placeholder="3:07"
          defaultValue={video?.duration ?? ""}
          aria-describedby="duration-hint"
          className={INPUT_CLASS}
        />
        <p id="duration-hint" className={HINT_CLASS}>
          YouTube ne l&apos;expose pas sans clé d&apos;API : à saisir à la main.
        </p>
      </div>

      <div>
        <label htmlFor="description" className={LABEL_CLASS}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          maxLength={MAX_DESCRIPTION_LENGTH}
          rows={4}
          defaultValue={video?.description ?? ""}
          className={INPUT_CLASS}
        />
      </div>

      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="visible"
          defaultChecked={video?.visible ?? true}
          className="size-5 accent-[var(--accent)]"
        />
        Visible sur le site
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={isSaving} className={PRIMARY_BUTTON_CLASS}>
          {isSaving ? "Enregistrement…" : "Enregistrer"}
        </button>
        <Link href="/admin/premierepro" className={SECONDARY_BUTTON_CLASS}>
          Annuler
        </Link>
      </div>
    </form>
  );
}
