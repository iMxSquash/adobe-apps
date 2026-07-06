---
name: adobe-shell
description: Socle des apps Adobe du portfolio (photoshop/illustrator/premierepro.elwen.dev) — routing multi-sous-domaines par hostname, thème sombre Adobe et accents par app, composants UI partagés (panneaux, onglets, toolbar, écran d'accueil), responsive en fenêtre du portfolio. À utiliser dès qu'on touche au routing, au layout commun, au thème ou à un composant partagé.
---

# Shell Adobe — routing multi-domaines + UI commune

Une seule app Next.js sert les 3 sous-domaines. Règle d'or : **tout ce qui existe dans au moins 2 apps vit dans `src/components/adobe/`** — les apps ne contiennent que leurs différences.

## Routing par hostname

Middleware : lire le host, rewriter vers le segment d'app, verrouiller le croisement.

```ts
const APP_BY_HOST: Record<string, string> = {
  "photoshop.elwen.dev": "photoshop",
  "illustrator.elwen.dev": "illustrator",
  "premierepro.elwen.dev": "premierepro",
};

export function middleware(req: NextRequest) {
  const host = req.headers.get("host")?.split(":")[0] ?? "";
  const app =
    APP_BY_HOST[host] ?? host.match(/^(photoshop|illustrator|premierepro)\.localhost$/)?.[1];
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin")) return protectAdmin(req); // admin commun, hors rewrite
  if (!app) return NextResponse.redirect("https://elwen.dev"); // host inconnu
  if (pathname.startsWith(`/${app}`)) return NextResponse.next();
  return NextResponse.rewrite(new URL(`/${app}${pathname}`, req.url));
}
```

- **Verrou anti-croisement** : `photoshop.elwen.dev/illustrator` ne doit pas répondre — si le pathname commence par le segment d'une AUTRE app, 404/redirect.
- Dev local : `photoshop.localhost:3000` marche nativement dans Chrome/Firefox. Le documenter dans le README.
- Les canonical/OG URLs utilisent le host public, pas le pathname interne réécrit.
- `frame-ancestors 'self' https://elwen.dev https://www.elwen.dev` dans `next.config.js` **dès le premier commit** (ces apps vivent en iframe dans le portfolio).

## Thème — tokens et accents

CSS variables injectées par un `<ThemeProvider app>` au niveau du layout de chaque app :

| Token                   | Valeur                                                             |
| ----------------------- | ------------------------------------------------------------------ |
| `--surface-0 / -1 / -2` | `#1e1e1e` (fond app) / `#252525` (panneaux) / `#323232` (éléments) |
| `--border`              | `#0f0f0f` (séparations dures, 1px)                                 |
| `--text / --text-dim`   | `#d4d4d4` / `#8a8a8a`                                              |
| `--accent`              | Ps `#31A8FF` · Ai `#FF9A00` · Pr `#9999FF`                         |

- Tailwind consomme les variables (`bg-[var(--surface-1)]` ou mapping dans la config) — **jamais de couleur Adobe en dur dans un composant partagé**.
- Le thème est toujours sombre : pas de `prefers-color-scheme` ici (fidélité Adobe).
- Typo UI Adobe : petite et dense — 11px pour les labels de panneaux, 12px pour les menus.

## Composants partagés (`src/components/adobe/`)

- **`<AppShell>`** : barre de menu Adobe en haut (Fichier, Édition, …, Aide — items factices mais menus réellement ouvrables : clic pour ouvrir, survol pour naviguer entre menus ouverts, Échap/clic extérieur pour fermer), zone centrale en grid, `<StatusBar>` en bas (zoom %, dimensions).
- **`<PanelGroup>` / `<Panel>`** : colonne de panneaux à onglets (façon Calques/Propriétés/Commentaires), header 24px avec le nom en 11px uppercase, repliable au double-clic du header.
- **`<FileTabs>`** : onglets de documents au-dessus du canvas — nom du fichier + croix, onglet actif avec un liseré `--accent`, scroll horizontal si débordement.
- **`<Toolbar>`** : barre verticale gauche d'icônes 24px, outil actif sur fond `--surface-2`, tooltip nommé après ~500ms.
- **`<HomeScreen>`** : écran d'accueil Adobe (« Bienvenue dans Photoshop ») — sidebar gauche (Accueil, Fichiers), grille de vignettes des œuvres/vidéos depuis Supabase, clic → ouvre le document. C'est la landing SEO : le nom/description des œuvres y est rendu **côté serveur**.

## Responsive en fenêtre du portfolio

Le viewport = la fenêtre macOS du portfolio, redimensionnée en continu de ~700×450 au plein écran :

- Sous **~900px de large** : la colonne de panneaux droite se replie en rail d'icônes (clic = panneau en overlay). Sous **~600px** : toolbar en overlay aussi.
- Mobile (iframe plein écran iOS) : 1 colonne — canvas/moniteur d'abord, panneaux en tiroirs bas.
- `100dvh` partout, `overflow` géré zone par zone (le body ne scrolle jamais).
- Débouncer les recalculs sur `resize` (le portfolio en envoie en continu pendant le drag).
- Liens sortants : `target="_blank" rel="noopener"` systématique (on est dans une iframe sans barre d'URL).
