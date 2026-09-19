"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

import { ADMIN_SECTIONS } from "@/lib/admin/section";
import { APP_LABEL } from "@/lib/adobe-theme";

import { SECONDARY_BUTTON_CLASS } from "./styles";

/** Switches between the three sections without leaving the current host (and its session). */
export function AdminNav() {
  const current = useSelectedLayoutSegment();

  return (
    <nav aria-label="Sections de l'administration" className="flex flex-wrap gap-2">
      {ADMIN_SECTIONS.map((section) => (
        <Link
          key={section}
          href={`/admin/${section}`}
          aria-current={current === section ? "page" : undefined}
          className={`${SECONDARY_BUTTON_CLASS} aria-[current=page]:border-accent aria-[current=page]:font-semibold`}
        >
          {APP_LABEL[section]}
        </Link>
      ))}
    </nav>
  );
}
