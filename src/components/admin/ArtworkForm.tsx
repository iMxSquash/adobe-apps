"use client";

import { useActionState, useEffect, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";

import { saveArtwork, type FormState } from "@/app/admin/(panel)/[section]/artwork-actions";
import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH } from "@/lib/admin/fields";
import type { Artwork, ArtworkApp } from "@/lib/content";

import {
  INPUT_CLASS,
  LABEL_CLASS,
  HINT_CLASS,
  PRIMARY_BUTTON_CLASS,
  SECONDARY_BUTTON_CLASS,
} from "./styles";
import {
  readImageDimensions,
  uploadArtworkImage,
  validateImageFile,
  type ImageDimensions,
} from "./upload-artwork-image";

const INITIAL_STATE: FormState = {};
const FILE_EXTENSION: Record<ArtworkApp, string> = { photoshop: ".psd", illustrator: ".ai" };

export function ArtworkForm({ app, artwork }: { app: ArtworkApp; artwork: Artwork | null }) {
  const [state, formAction, isSaving] = useActionState(
    saveArtwork.bind(null, app, artwork?.id ?? null),
    INITIAL_STATE,
  );
  const [, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  async function handleFileChange(selected: File | undefined) {
    setClientError(null);
    if (!selected) return;
    const problem = validateImageFile(selected);
    if (problem) {
      setClientError(problem);
      return;
    }
    try {
      setDimensions(await readImageDimensions(selected));
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    } catch (error) {
      console.warn("Unreadable image:", error);
      setClientError("Image illisible par le navigateur.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setClientError(null);

    if (file && dimensions) {
      setIsUploading(true);
      try {
        const title = String(formData.get("title") ?? "");
        formData.set("image_path", await uploadArtworkImage(file, title));
        formData.set("width", String(dimensions.width));
        formData.set("height", String(dimensions.height));
      } catch (error) {
        setClientError(error instanceof Error ? error.message : "L'envoi de l'image a échoué.");
        return;
      } finally {
        setIsUploading(false);
      }
    }
    startTransition(() => formAction(formData));
  }

  const error = clientError ?? state.error;
  const shownImage = previewUrl ?? artwork?.image_url ?? null;
  const isBusy = isUploading || isSaving;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label htmlFor="image" className={LABEL_CLASS}>
          Image {artwork ? "(laisser vide pour conserver l'actuelle)" : ""}
        </label>
        <input
          id="image"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          required={!artwork}
          onChange={(event) => void handleFileChange(event.target.files?.[0])}
          className={INPUT_CLASS}
        />
        <p className={HINT_CLASS}>PNG, JPEG, WebP ou AVIF, 10 Mo maximum. Le SVG est refusé.</p>
        {shownImage && (
          // Plain <img>: a blob: preview URL cannot go through next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shownImage}
            alt="Aperçu de l'œuvre"
            className="mt-3 max-h-64 rounded border border-border bg-surface-0 object-contain"
          />
        )}
        {(dimensions ?? artwork) && (
          <p className={HINT_CLASS}>
            {dimensions?.width ?? artwork?.width} × {dimensions?.height ?? artwork?.height} px
          </p>
        )}
      </div>

      <div>
        <label htmlFor="title" className={LABEL_CLASS}>
          Titre (nom du fichier, sans extension {FILE_EXTENSION[app]})
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={MAX_TITLE_LENGTH}
          defaultValue={artwork?.title}
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label htmlFor="slug" className={LABEL_CLASS}>
          Slug (URL)
        </label>
        <input id="slug" name="slug" defaultValue={artwork?.slug} className={INPUT_CLASS} />
        <p className={HINT_CLASS}>Laisser vide pour le générer depuis le titre.</p>
      </div>

      <div>
        <label htmlFor="layer_name" className={LABEL_CLASS}>
          Nom du calque
        </label>
        <input
          id="layer_name"
          name="layer_name"
          required
          maxLength={MAX_TITLE_LENGTH}
          defaultValue={artwork?.layer_name}
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label htmlFor="description" className={LABEL_CLASS}>
          Description (affichée en commentaire)
        </label>
        <textarea
          id="description"
          name="description"
          required
          maxLength={MAX_DESCRIPTION_LENGTH}
          rows={5}
          defaultValue={artwork?.description}
          className={INPUT_CLASS}
        />
      </div>

      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="visible"
          defaultChecked={artwork?.visible ?? true}
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
        <button type="submit" disabled={isBusy} className={PRIMARY_BUTTON_CLASS}>
          {isUploading ? "Envoi de l'image…" : isSaving ? "Enregistrement…" : "Enregistrer"}
        </button>
        <Link href={`/admin/${app}`} className={SECONDARY_BUTTON_CLASS}>
          Annuler
        </Link>
      </div>
    </form>
  );
}
