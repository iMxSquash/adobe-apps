"use server";

import { redirect } from "next/navigation";

import { readText } from "@/lib/admin/fields";
import { createServerSupabase } from "@/lib/supabase-server";

export interface LoginState {
  error?: string;
}

// Generic on purpose: never reveal whether an account exists. Brute force is throttled by Supabase Auth.
const INVALID_CREDENTIALS = "Identifiants invalides.";

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = readText(formData, "email");
  const password = formData.get("password");
  if (!email || typeof password !== "string" || !password) return { error: INVALID_CREDENTIALS };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: INVALID_CREDENTIALS };

  redirect("/admin");
}
