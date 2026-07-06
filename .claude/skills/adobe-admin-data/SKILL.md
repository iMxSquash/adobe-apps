---
name: adobe-admin-data
description: Données et backoffice des apps Adobe — schéma Supabase (artworks, videos), RLS, upload d'images avec dimensions, extraction YouTube (ID, titre, durée via oEmbed), admin par sous-domaine protégé par Supabase Auth. À utiliser pour tout travail sur /admin, le schéma, les uploads ou l'ingestion d'URL YouTube.
---

# Admin & données — Supabase (projet partagé avec le portfolio)

Même projet Supabase que le portfolio (mêmes env vars), tables et bucket dédiés. **Relire la section « Invariants elwen.dev » de la skill check-security avant tout travail ici** — c'est la partie la plus sensible des apps.

## Schéma

```sql
create table artworks (
  id uuid primary key default gen_random_uuid(),
  app text not null check (app in ('photoshop','illustrator')),
  title text not null,            -- nom de fichier SANS extension (le front ajoute .psd/.ai)
  slug text not null unique,
  image_url text not null,
  layer_name text not null,
  description text not null,      -- le commentaire
  width int, height int,          -- remplis à l'upload
  sort_order int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);
create table videos (
  id uuid primary key default gen_random_uuid(),
  title text not null, slug text not null unique,
  youtube_id text not null check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  description text, duration text,          -- 'mm:ss'
  sort_order int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);
```

- **RLS sur les deux tables** : `select` public si `visible = true` ; insert/update/delete → `authenticated`. Le check `youtube_id` en base = dernière ligne de défense.
- Bucket `artworks` : lecture publique, écriture `authenticated` (policies du bucket, pas seulement l'UI).
- Rappel : inscriptions Supabase Auth **désactivées** (un seul compte, le même que le backoffice portfolio).

## Admin par sous-domaine

- Route `/admin` commune (hors rewrite du middleware — voir adobe-shell), le **host détermine le contenu par défaut** : photoshop → œuvres Ps, illustrator → œuvres Ai, premierepro → vidéos. Switcher en haut pour passer de l'un à l'autre sans changer de domaine.
- Protection : middleware **+ re-vérification de session dans chaque Server Action** (`supabase.auth.getUser()` — pas `getSession()` qui ne revalide pas le JWT côté serveur).
- Toute écriture termine par `revalidatePath` des pages publiques touchées (home de l'app + `/[slug]`).
- L'admin ne doit pas être embarquable : il est sous les mêmes headers `frame-ancestors` que l'app — acceptable car seul `elwen.dev` (à toi) peut l'iframer ; ne pas élargir la liste.

## Upload d'œuvres (Ps/Ai)

- **Formats acceptés : png, webp, jpeg, avif. SVG refusé** (XSS stockée — règle check-security). Valider le MIME déclaré ET les magic bytes côté serveur ; taille max ~10 Mo.
- **Dimensions lues à l'upload côté client** (remplissent `width/height`) :

```ts
const bmp = await createImageBitmap(file); // { width, height }
```

- Nom de fichier régénéré (`{slug}-{nanoid}.{ext}`) — jamais le nom original de l'utilisateur dans le Storage.
- Prévisualisation dans le formulaire avant envoi ; à la suppression d'une œuvre, supprimer aussi le fichier du bucket (pas d'orphelins).

## Ingestion d'URL YouTube (Pr)

Le formulaire accepte n'importe quelle forme d'URL et normalise :

```ts
// watch?v=ID | youtu.be/ID | shorts/ID | embed/ID  → ID (11 chars [A-Za-z0-9_-])
const YT_ID = /(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/;
```

- **Titre via oEmbed** (pas de clé API) : `https://www.youtube.com/oembed?url=https://youtu.be/{id}&format=json` → `{ title, thumbnail_url }`. Appel **côté serveur** (Server Action) — pas de CORS ni d'URL utilisateur relayée telle quelle (on reconstruit l'URL depuis l'ID extrait : anti-SSRF).
- **Durée** : oEmbed ne la fournit pas. Stratégie : champ `duration` saisi manuellement dans le formulaire (simple, fiable), pré-rempli si une clé YouTube Data API v3 est un jour ajoutée (`videos?part=contentDetails`). Ne pas scraper la page YouTube.
- Aperçu embed (façade, comme dans l'app) dans le formulaire après extraction réussie.
- Erreurs propres : URL non reconnue, vidéo privée/supprimée (oEmbed → 401/404) — message clair, pas d'insert.

## Qualité de vie admin

- Liste avec drag de réordonnancement (écrit `sort_order`) ou flèches ↑↓ ; toggle `visible` inline.
- `slug` auto depuis `title` (kebab-case, dédoublonné), éditable.
- Suppression : confirmation + rappel de ce qui sera supprimé (fichier Storage inclus).
