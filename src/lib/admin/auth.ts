import type { SupabaseClient, User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createServerSupabase } from "@/lib/supabase-server";

export const ADMIN_LOGIN_PATH = "/admin/login";

export interface AdminContext {
  supabase: SupabaseClient;
  user: User;
}

// `getUser()` revalidates the JWT with Supabase Auth; `getSession()` would only decode the cookie.
async function getAdminContext(): Promise<AdminContext | null> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user ? { supabase, user: data.user } : null;
}

/** For pages: unauthenticated visitors are sent to the login form. */
export async function requireAdminPage(): Promise<AdminContext> {
  const context = await getAdminContext();
  if (!context) redirect(ADMIN_LOGIN_PATH);
  return context;
}

/** For Server Actions: they are public endpoints, so every one re-checks the session. */
export async function requireAdminAction(): Promise<AdminContext> {
  const context = await getAdminContext();
  if (!context) throw new Error("Unauthorized");
  return context;
}
