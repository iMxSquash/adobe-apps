import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

import { ADMIN_APP_HEADER } from "@/lib/admin/section";
import { getSupabaseEnv } from "@/lib/supabase-env";

const APPS = ["photoshop", "illustrator", "premierepro"] as const;
type AppId = (typeof APPS)[number];

const APP_BY_HOST: Record<string, AppId> = {
  "photoshop.elwen.dev": "photoshop",
  "illustrator.elwen.dev": "illustrator",
  "premierepro.elwen.dev": "premierepro",
};

function appForHost(host: string): AppId | undefined {
  return (
    APP_BY_HOST[host] ??
    (host.match(/^(photoshop|illustrator|premierepro)\.localhost$/)?.[1] as AppId | undefined)
  );
}

const ADMIN_PATH = "/admin";
const ADMIN_LOGIN_PATH = "/admin/login";

/** Refreshes the Supabase session cookies and gates `/admin/*` (login page excepted). */
async function proxyAdmin(req: NextRequest, app: AppId | undefined): Promise<NextResponse> {
  // Overwritten on every request so a client-supplied value can never reach the pages.
  const headers = new Headers(req.headers);
  if (app) headers.set(ADMIN_APP_HEADER, app);
  else headers.delete(ADMIN_APP_HEADER);

  let response = NextResponse.next({ request: { headers } });
  const { url, anonKey } = getSupabaseEnv();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value } of cookiesToSet) req.cookies.set(name, value);
        response = NextResponse.next({ request: { headers } });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const isLoginPage = req.nextUrl.pathname === ADMIN_LOGIN_PATH;
  if (!data.user && !isLoginPage) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, req.url));
  }
  return response;
}

export default async function proxy(req: NextRequest) {
  const host = req.headers.get("host")?.split(":")[0] ?? "";
  const app = appForHost(host);
  const { pathname } = req.nextUrl;

  // Admin commun aux 3 hosts, servi hors rewrite
  if (pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`)) {
    return proxyAdmin(req, app);
  }

  // Dev : localhost nu → on renvoie vers un sous-domaine d'app
  if (!app && (host === "localhost" || host === "127.0.0.1")) {
    const url = req.nextUrl.clone();
    url.host = `photoshop.localhost:${url.port || "3000"}`;
    return NextResponse.redirect(url);
  }

  // Host inconnu (ex. *.vercel.app) → retour au portfolio
  if (!app) return NextResponse.redirect("https://elwen.dev");

  // Verrou anti-croisement : le segment d'une autre app ne répond pas sur ce host
  const crossApp = APPS.some(
    (a) => a !== app && (pathname === `/${a}` || pathname.startsWith(`/${a}/`)),
  );
  if (crossApp) return new NextResponse(null, { status: 404 });

  if (pathname === `/${app}` || pathname.startsWith(`/${app}/`)) return NextResponse.next();

  return NextResponse.rewrite(new URL(`/${app}${pathname}`, req.url));
}

export const config = {
  // Tout sauf les assets Next, les fichiers statiques et les routes API
  matcher: ["/((?!_next/static|_next/image|api/|.*\\..*).*)"],
};
