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

L'admin est commun aux 3 hosts : `http://photoshop.localhost:3000/admin`.

Chaque host est verrouillé sur son app : `photoshop.localhost:3000/illustrator` répond 404.

## Scripts

- `npm run dev` / `build` / `start`
- `npm run lint` — ESLint
- `npm run format` / `format:check` — Prettier
