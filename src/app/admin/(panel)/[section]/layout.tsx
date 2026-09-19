import { notFound } from "next/navigation";

import { parseSection } from "@/lib/admin/section";

export default async function SectionLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ section: string }> }>) {
  const section = parseSection((await params).section);
  if (!section) notFound();

  return <div data-app={section}>{children}</div>;
}
