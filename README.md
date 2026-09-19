# adobe-apps

Une seule app Next.js qui reproduit les UIs Adobe et sert 3 sous-domaines, routés par hostname (`src/proxy.ts`) :

- `photoshop.elwen.dev` — œuvres Photoshop
- `illustrator.elwen.dev` — œuvres Illustrator
- `premierepro.elwen.dev` — vidéos YouTube façon Premiere Pro

Ces apps tournent en iframe dans le portfolio macOS ([elwen.dev](https://elwen.dev), repo `portfolio`) — d'où le header `Content-Security-Policy: frame-ancestors` dans `next.config.ts`, à ne jamais retirer.

## Dev local

```bash
npm install
cp .env.example .env.local   # clés du projet Supabase partagé avec le portfolio
npm run dev
```

Puis ouvrir **http://photoshop.localhost:3000** (ou `illustrator.localhost:3000`, `premierepro.localhost:3000`) — les sous-domaines `*.localhost` fonctionnent nativement dans Chrome et Firefox, sans toucher à `/etc/hosts`. `http://localhost:3000` nu redirige vers `photoshop.localhost:3000`.

## Admin

L'admin est commun aux 3 hosts : `http://photoshop.localhost:3000/admin`. Le host choisit la section par défaut (photoshop : œuvres Ps, illustrator : œuvres Ai, premierepro : vidéos), un sélecteur permet de passer de l'une à l'autre.

- Connexion Supabase Auth (même compte que le backoffice du portfolio, inscriptions désactivées). Le cookie de session est propre à chaque host : une connexion par sous-domaine.
- `/admin/*` est protégé par `src/proxy.ts` et chaque Server Action revérifie la session (`getUser()`).
- Œuvres : upload direct vers le bucket `artworks` via URL signée (PNG, JPEG, WebP, AVIF, 10 Mo max, SVG refusé), les magic bytes sont vérifiés côté serveur avant l'enregistrement.
- Vidéos : coller une URL YouTube (watch, youtu.be, shorts, embed), le titre est récupéré via oEmbed, la durée (`mm:ss`) est saisie à la main.

Chaque host est verrouillé sur son app : `photoshop.localhost:3000/illustrator` répond 404.

## Scripts

- `npm run dev` / `build` / `start`
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript
- `npm test` — Vitest (unit tests, `src/**/*.test.ts`)
- `npm run format` / `format:check` — Prettier

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs lint, typecheck, tests, Prettier check and build on every pull request and push to `main`.
