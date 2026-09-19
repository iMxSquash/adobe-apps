"use client";

import { useRef } from "react";

import { DANGER_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from "./styles";

interface DeleteButtonProps {
  itemTitle: string;
  /** What will be lost besides the row, so the confirmation is an informed one. */
  consequences: string;
  action: () => Promise<void>;
}

export function DeleteButton({ itemTitle, consequences, action }: DeleteButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={SECONDARY_BUTTON_CLASS}
      >
        Supprimer
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="delete-title"
        className="m-auto max-w-sm rounded border border-border bg-surface-1 p-5 text-text backdrop:bg-black/60"
      >
        <form action={action} className="flex flex-col gap-4">
          <h2 id="delete-title" className="text-base font-semibold">
            Supprimer « {itemTitle} » ?
          </h2>
          <p className="text-sm text-text-dim">{consequences} Cette action est irréversible.</p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className={SECONDARY_BUTTON_CLASS}
            >
              Annuler
            </button>
            <button type="submit" className={DANGER_BUTTON_CLASS}>
              Supprimer définitivement
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
