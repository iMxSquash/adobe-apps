import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_APP_HEADER, parseSection } from "@/lib/admin/section";

const DEFAULT_SECTION = "photoshop";

// The host decides the default section (set by the proxy, never by the client).
export default async function AdminIndexPage() {
  const app = parseSection((await headers()).get(ADMIN_APP_HEADER));
  redirect(`/admin/${app ?? DEFAULT_SECTION}`);
}
