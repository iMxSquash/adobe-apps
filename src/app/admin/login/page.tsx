import { redirect } from "next/navigation";

import { createServerSupabase } from "@/lib/supabase-server";

import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/admin");

  return (
    <main className="mx-auto flex min-h-full max-w-sm flex-col justify-center gap-6 px-4 py-10">
      <h1 className="text-xl font-semibold">Connexion à l&apos;administration</h1>
      <LoginForm />
    </main>
  );
}
