# Apps Adobe — TODO (photoshop / illustrator / premierepro .elwen.dev)

> **Concept** : une seule app Next.js qui sert les 3 sous-domaines (routing par hostname). Chaque app reproduit l'UI Adobe et affiche mes travaux :
>
> - **Photoshop / Illustrator** : chaque « fichier » = une œuvre → image, nom de calque (panneau Calques), description affichée en **commentaire** dans le fichier (panneau Commentaires / épingle sur le canvas, comme la collaboration Adobe)
> - **Premiere Pro** : des liens YouTube → l'embed YouTube remplace le **moniteur du programme** (prévisualisateur)
> - Un **admin** (`/admin` sur chaque sous-domaine) pour gérer œuvres et vidéos
>
> **Stack** : Next.js (App Router) · TypeScript · Tailwind · même projet **Supabase** que le portfolio (tables + bucket dédiés) · Vercel (1 déploiement, 3 domaines)
>
> ⚠️ Ces apps tournent en **iframe dans le portfolio** : appliquer la skill `portfolio-embed-check` avant chaque mise en prod.

---

## Phase 0 — Setup & routing multi-domaines

- [x] Créer le repo `adobe-apps` + projet Next.js (App Router, TS, Tailwind, ESLint/Prettier — mêmes conventions que le portfolio)
- [x] Structure :
  - `src/app/(apps)/photoshop/`, `.../illustrator/`, `.../premierepro/` — une route racine par app
  - `src/app/admin/` — admin commun
  - `src/components/adobe/` — UI partagée (panneaux, onglets, toolbars)
  - `src/lib/` — client Supabase, thèmes par app
- [x] **Middleware de routing par hostname** : `photoshop.elwen.dev` → rewrite vers `/photoshop`, etc. (lire `request.headers.get('host')`) — `src/proxy.ts` (nom Next 16 du middleware)
- [x] Dev local multi-domaines : `photoshop.localhost:3000` fonctionne nativement dans Chrome/Firefox (le documenter dans le README) ; fallback `?app=photoshop` si besoin
- [x] Projet Vercel + assigner les 3 domaines `photoshop/illustrator/premierepro.elwen.dev` (actifs dès que le DNS wildcard sera posé chez OVH)
- [x] Variables d'env : réutiliser les clés du **projet Supabase du portfolio**
- [x] **Dès le jour 1** : headers `Content-Security-Policy: frame-ancestors 'self' https://elwen.dev https://www.elwen.dev` dans `next.config.js` (condition d'embed dans le portfolio — voir skill `portfolio-embed-check`)
- [x] Empêcher l'accès croisé (`photoshop.elwen.dev/illustrator` ne doit pas exister) : le middleware force chaque host sur son app

## Phase 1 — UI commune Adobe

- [ ] **Design tokens** du thème sombre Adobe : fonds `#1e1e1e` / `#252525` / `#323232`, bordures `#0f0f0f`, texte `#d4d4d4`, accent par app (Ps `#31A8FF`, Ai `#FF9A00`, Pr `#9999FF`) — via CSS variables, le thème est injecté par l'app active
- [ ] Composants partagés :
  - [ ] `<AppShell>` : barre de menu Adobe (Fichier, Édition, Image/Objet/Séquence, Fenêtre, Aide — menus factices mais ouvrables, même mécanique que la menu bar du portfolio)
  - [ ] `<PanelGroup>` / `<Panel>` : panneaux à onglets empilables (façon Calques/Propriétés), repliables
  - [ ] `<FileTabs>` : onglets de fichiers ouverts en haut du canvas (nom + croix de fermeture)
  - [ ] `<Toolbar>` : barre d'outils verticale à icônes (outils factices, tooltip au survol, outil « actif »)
  - [ ] `<StatusBar>` : barre du bas (zoom %, dimensions du document)
- [ ] **Écran d'accueil** façon Adobe (« Bienvenue dans Photoshop ») : grille des fichiers récents = la liste des œuvres depuis Supabase ; clic → ouvre le fichier
- [ ] Layout **responsive fenêtre portfolio** : utilisable dès ~700×450 (les panneaux latéraux se replient en icônes sous un seuil de largeur), `100dvh`, aucun débordement horizontal

## Phase 2 — Données (Supabase)

- [ ] Table `artworks` :
  ```sql
  id uuid pk, app text check (app in ('photoshop','illustrator')),
  title text,                -- nom du fichier affiché dans l'onglet (ex. affiche-concert.psd / logo-x.ai)
  image_url text,            -- l'œuvre
  layer_name text,           -- nom du calque affiché dans le panneau Calques
  description text,          -- le commentaire affiché dans le fichier
  width int, height int,     -- dimensions affichées (status bar, nouveau document)
  sort_order int, visible boolean default true,
  created_at timestamptz default now()
  ```
- [ ] Table `videos` :
  ```sql
  id uuid pk, title text,        -- nom de la séquence dans Premiere
  youtube_id text,               -- extrait de l'URL à l'insertion
  description text, duration text,
  sort_order int, visible boolean default true,
  created_at timestamptz default now()
  ```
- [ ] RLS : lecture publique (`visible = true`), écriture authentifiée (même compte Supabase Auth que le backoffice portfolio)
- [ ] Bucket Storage `artworks` (lecture publique, upload authentifié)
- [ ] Fetch côté Server Components + `revalidatePath` après modification admin

## Phase 3 — Photoshop (photoshop.elwen.dev)

- [ ] Layout : toolbar gauche · canvas central · colonne droite (panneaux **Calques**, Commentaires, Propriétés) · onglets fichiers en haut
- [ ] **Canvas** : fond damier de transparence, l'image de l'œuvre centrée avec son ombre, zoom via molette + Cmd/Ctrl et boutons (25–200 %), pan au drag (bonus : outil main)
- [ ] **Panneau Calques** fidèle : ligne « Arrière-plan » verrouillée (cadenas) + ligne du calque avec **vignette de l'image + `layer_name`**, œil de visibilité cliquable (masque réellement l'image — détail qui fait mouche), opacité/mode de fusion factices
- [ ] **Commentaire = la description** : panneau Commentaires (avatar + « Elwen » + date + texte) **et** épingle de commentaire posée sur le canvas qui ouvre la bulle au clic — comme la collaboration Adobe
- [ ] Onglets multi-fichiers : toutes les œuvres `app='photoshop'` ouvrables simultanément, switch par onglet, état par fichier conservé (zoom, visibilité calque)
- [ ] Fermeture du dernier onglet → retour écran d'accueil
- [ ] Détails de fidélité : nom de fichier `*.psd` dans l'onglet, `title` + zoom dans la barre de titre du document, status bar avec dimensions réelles de l'image

## Phase 4 — Illustrator (illustrator.elwen.dev)

- [ ] Réutilise le shell de la Phase 3 avec le thème Ai (accent orange) — ne dupliquer AUCUN composant, seules les différences sont locales :
  - [ ] Canvas = **plan de travail blanc** (pas de damier), zone de travail grise autour, libellé « Plan de travail 1 »
  - [ ] Onglets `*.ai`
  - [ ] Toolbar avec les outils Illustrator (sélection, plume, forme, texte…)
  - [ ] Panneaux droits : Calques (même mécanique vignette + `layer_name` + œil), Commentaires (description), Nuancier factice
- [ ] Œuvres filtrées sur `app='illustrator'`
- [ ] Vérifier le rendu des deux thèmes côte à côte (deux fenêtres dans le portfolio ouvertes en même temps)

## Phase 5 — Premiere Pro (premierepro.elwen.dev)

- [ ] Layout 4 zones façon Premiere : **chutier/projet** (en bas à gauche) · **moniteur du programme** (en haut à droite) · **timeline** (en bas à droite) · panneau source/effets (en haut à gauche, factice)
- [ ] **Moniteur du programme = embed YouTube** : `youtube-nocookie.com/embed/<youtube_id>`, chargé au clic sur une séquence. Façade légère (vignette `i.ytimg.com` + bouton play) avant de monter l'iframe YouTube — perf et pas de cookies au chargement
- [ ] **Chutier** : liste des `videos` en vignettes YouTube + `title` + `duration`, double-clic → charge la séquence dans le moniteur
- [ ] **Timeline factice mais vivante** : pistes V1/A1 avec des blocs colorés proportionnels à `duration`, tête de lecture. Bonus : synchroniser la tête de lecture avec le player via l'API YouTube IFrame
- [ ] Contrôles sous le moniteur (lecture, image par image — pilotent le player via l'API IFrame si le bonus est fait, sinon décoratifs)
- [ ] Barre du haut : workspaces Premiere (« Montage », « Couleur », « Audio » — factices)
- [ ] ⚠️ iframe YouTube **dans** l'iframe du portfolio : ça fonctionne, mais tester tôt le clic play à travers les deux niveaux (et penser à l'overlay drag du portfolio)

## Phase 6 — Admin (`/admin` sur chaque sous-domaine)

- [ ] Login Supabase Auth (même compte que le portfolio), middleware qui protège `/admin/*` sur les 3 hosts
- [ ] L'admin s'adapte au sous-domaine : sur `photoshop.elwen.dev/admin` → œuvres Photoshop ; `illustrator...` → œuvres Illustrator ; `premierepro...` → vidéos (avec un switcher pour naviguer entre les trois sans changer de domaine)
- [ ] **CRUD œuvres** (Ps/Ai) : titre, **upload image** (→ bucket `artworks`, lire les dimensions à l'upload pour remplir `width/height`), `layer_name`, `description` (le commentaire), ordre, visibilité — avec prévisualisation de l'image
- [ ] **CRUD vidéos** (Pr) : coller n'importe quelle URL YouTube (watch/youtu.be/shorts) → **extraction du `youtube_id`** + récupération auto du titre et de la durée via oEmbed, ordre, visibilité, aperçu embed dans le formulaire
- [ ] Suppression avec confirmation + nettoyage du fichier dans le Storage
- [ ] `revalidatePath` des apps concernées après chaque écriture

## Phase 7 — Embed-readiness & mise en ligne

- [ ] Dérouler la skill **`portfolio-embed-check`** sur les 3 sous-domaines (headers, `window.top`, liens externes en `_blank`, harnais de test 700×450)
- [ ] Perf : first paint < 2s (images `next/image`, façade YouTube, pas d'écran bloquant à l'ouverture — l'écran d'accueil Adobe EST la landing)
- [ ] Test resize continu dans le harnais : les panneaux se replient proprement, pas de scroll horizontal
- [ ] Test mobile (mode iOS du portfolio = iframe plein écran) : layout 1 colonne — canvas/moniteur d'abord, panneaux en tiroirs
- [ ] Test dans le vrai portfolio : ouvrir les 3 fenêtres en même temps, drag/resize/minimize/restore, player YouTube qui continue en arrière-plan quand la fenêtre Premiere perd le focus
- [ ] Ajouter les 3 apps dans le backoffice du portfolio en mode `iframe` 🚀

---

## Décisions actées (référence)

| Sujet           | Décision                                                                                                                   |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Architecture    | 1 seule app Next.js, 3 sous-domaines routés par hostname (middleware)                                                      |
| Données / admin | Même projet Supabase que le portfolio ; admin dédié dans l'app (`<sousdomaine>/admin`), même compte Auth                   |
| Ps / Ai         | 1 « fichier » = 1 œuvre : image + `layer_name` (panneau Calques) + `description` en commentaire (panneau + épingle canvas) |
| Premiere Pro    | Vidéos YouTube ; l'embed remplace le moniteur du programme ; chutier + timeline factice                                    |
| Embed           | `frame-ancestors` dès le jour 1, validation via la skill `portfolio-embed-check`                                           |
