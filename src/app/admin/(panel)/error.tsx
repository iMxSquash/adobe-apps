"use client";

import { PRIMARY_BUTTON_CLASS } from "@/components/admin/styles";

// The error message and stack stay in the server logs; the digest links the two.
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-start gap-4 px-4 py-10">
      <h1 className="text-xl font-semibold">Une erreur est survenue</h1>
      <p className="text-sm text-text-dim">
        L&apos;opération a échoué. Réessaie, ou consulte les logs serveur
        {error.digest ? ` (référence ${error.digest})` : ""}.
      </p>
      <button type="button" onClick={reset} className={PRIMARY_BUTTON_CLASS}>
        Réessayer
      </button>
    </main>
  );
}
