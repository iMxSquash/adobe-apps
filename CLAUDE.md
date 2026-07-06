# adobe-apps — photoshop / illustrator / premierepro .elwen.dev

Une seule app Next.js qui reproduit les UIs Adobe et sert 3 sous-domaines (routing par hostname). Ces apps tournent **en iframe dans le portfolio macOS** (elwen.dev) — repo `portfolio`, roadmap partagée : `../portfolio/TODO-adobe-apps.md` (**cocher les cases en avançant**).

- **Photoshop / Illustrator** : 1 « fichier » = 1 œuvre (`artworks`) — image + `layer_name` (panneau Calques) + `description` en commentaire (panneau + épingle canvas)
- **Premiere Pro** : vidéos YouTube (`videos`) — l'embed remplace le moniteur du programme
- **Admin** : `/admin` sur chaque sous-domaine, adapté au host

## Stack (décisions actées — ne pas rediscuter)

- Next.js (App Router) + TypeScript + Tailwind, un seul déploiement Vercel, 3 domaines
- **Même projet Supabase que le portfolio** (tables `artworks`/`videos`, bucket `artworks`, même compte Auth, inscriptions désactivées)
- Dev local multi-domaines : `photoshop.localhost:3000`

## Points non négociables

- `frame-ancestors 'self' https://elwen.dev https://www.elwen.dev` dans `next.config.js` — condition d'existence de ces apps, ne jamais retirer
- Tout composant présent dans ≥ 2 apps vit dans `src/components/adobe/` — les apps ne portent que leurs différences
- Couleurs via CSS variables du thème (accent par app) — jamais en dur dans un composant partagé
- Utilisable dès ~700×450 (fenêtre du portfolio) et en mobile plein écran ; liens sortants en `_blank rel=noopener`
- Contenu clé (œuvres, vidéos) rendu **côté serveur** avec une URL `/[slug]` par entité (SEO)
- `youtube_id` validé `^[A-Za-z0-9_-]{11}$` partout ; upload SVG refusé ; RLS sur toutes les tables

## Skills — à charger AVANT de coder la partie concernée

**Projet** (`.claude/skills/`) :

| Skill              | Quand                                                                       |
| ------------------ | --------------------------------------------------------------------------- |
| `adobe-shell`      | Routing hostname/middleware, thème, composants partagés, responsive fenêtre |
| `adobe-docs-apps`  | Photoshop & Illustrator : canvas, zoom/pan, calques, commentaires, onglets  |
| `adobe-premiere`   | Premiere : layout 4 zones, façade YouTube, chutier, timeline, API IFrame    |
| `adobe-admin-data` | Schéma Supabase, RLS, `/admin`, uploads, ingestion URL YouTube              |

**Utilisateur** (`~/.claude/skills/`) :

| Skill                   | Quand                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| `portfolio-embed-check` | Avant chaque mise en prod : valider l'embed des 3 sous-domaines dans le portfolio               |
| `seo-geo-boost`         | Metadata, JSON-LD (`VisualArtwork`, `VideoObject`), sitemap, llms.txt — sur chaque sous-domaine |

**Sécurité** : la skill `check-security` (repo portfolio, `../portfolio/.claude/skills/check-security/`) contient la section « Invariants elwen.dev » qui couvre AUSSI ce repo — la dérouler avant merge et après tout travail admin/auth/upload.

## Conventions

- Fidélité Adobe avant tout : en cas de doute sur un détail d'UI, vérifier sur une capture du vrai logiciel
- Contenu géré (œuvres, vidéos) : Supabase uniquement — rien en dur dans le code
- Nommage code en anglais, contenu en français

## Git

- Branche principale : `main`
- Feature branches : `feat/nom-feature`
- Fix branches : `fix/nom-bug`
- Commits conventionnels : `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- PR obligatoire vers main (même en solo, pour l'historique)
- **Pas de `Co-Authored-By` dans les messages de commit** — ne jamais ajouter de trailer Claude/AI
- Un commit = un changement logique cohérent (pas de "fix stuff" fourre-tout)
- Description en anglais, impératif, < 72 caractères
