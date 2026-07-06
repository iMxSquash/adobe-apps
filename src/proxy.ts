import { NextRequest, NextResponse } from "next/server";

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

export default function proxy(req: NextRequest) {
  const host = req.headers.get("host")?.split(":")[0] ?? "";
  const app = appForHost(host);
  const { pathname } = req.nextUrl;

  // Admin commun aux 3 hosts, servi hors rewrite (protection auth : Phase 6)
  if (pathname.startsWith("/admin")) return NextResponse.next();

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
