---
name: adobe-premiere
description: Spécifications de l'app Premiere Pro (premierepro.elwen.dev) — layout 4 zones, embed YouTube en façade qui remplace le moniteur du programme, chutier des vidéos, timeline factice synchronisable via l'API YouTube IFrame. À utiliser pour tout travail sur l'app Premiere, le player YouTube ou la timeline.
---

# Premiere Pro — vidéos YouTube dans l'UI de montage

Une « séquence » = une ligne `videos` : `youtube_id`, `title`, `duration`, `description`. Le **moniteur du programme** (zone de prévisualisation) est remplacé par un embed YouTube. Le reste de l'UI vend l'illusion du logiciel de montage.

## Layout 4 zones (grid, façon workspace « Montage »)

```
┌───────────────┬──────────────────────┐
│ Source/Effets │  Moniteur programme  │   ← rangée haute ~55 %
│   (factice)   │   = EMBED YOUTUBE    │
├───────────────┼──────────────────────┤
│   Chutier     │      Timeline        │   ← rangée basse
│ (les vidéos)  │  V1/A1 + tête lecture│
└───────────────┴──────────────────────┘
```

- Barre du haut : onglets workspaces (« Montage » actif, « Couleur », « Audio », « Effets » factices).
- Panneaux avec les headers 11px uppercase du shell (`adobe-shell`). Séparateurs de zones draggables en bonus.
- Responsive fenêtre : sous ~700px de large, empiler moniteur → timeline → chutier ; le panneau source disparaît en premier.

## Moniteur = embed YouTube en façade (perf + vie privée)

**Jamais d'iframe YouTube montée au chargement.** Pattern façade :

1. Au repos : vignette `https://i.ytimg.com/vi/{id}/hqdefault.jpg` + bouton play style Premiere par-dessus.
2. Au clic (ou double-clic d'une séquence du chutier) : monter l'iframe `https://www.youtube-nocookie.com/embed/{id}?enablejsapi=1&autoplay=1&rel=0`.
3. Changer de séquence : remplacer l'iframe (nouvelle key), pas de stack d'iframes.

- `youtube-nocookie.com` obligatoire (pas de cookies avant interaction) + `enablejsapi=1` pour piloter le player.
- **Valider `youtube_id`** contre `^[A-Za-z0-9_-]{11}$` avant toute injection dans l'URL (règle check-security) — même si l'admin l'a déjà fait à l'insertion.
- ⚠️ Double imbrication : iframe YouTube DANS l'iframe du portfolio. Ça fonctionne, mais tester tôt le clic play à travers les deux niveaux ; l'`allow="autoplay; fullscreen"` doit être posé sur l'iframe YouTube ET le portfolio doit le déléguer sur la sienne (`allow` de `<IframeWindow>` côté portfolio).
- Sous le moniteur : timecode `00:00:12:04` + contrôles (lecture/pause, ±1 image) — branchés sur l'API IFrame si le bonus sync est fait, sinon décoratifs mais réactifs au hover.

## Chutier (panneau Projet)

- Liste des `videos` : vignette YouTube 64px, `title`, `duration` en colonne (layout tableau dense Premiere : lignes 28px, texte 11px).
- Double-clic → charge la séquence dans le moniteur + surligne la ligne (fond `--accent` 30 %).
- La séquence active affiche une petite icône « en lecture ».
- Rendu **serveur** de la liste (c'est le contenu SEO de la page) ; chaque vidéo a une URL `/[slug]` avec JSON-LD `VideoObject` (name, thumbnailUrl `i.ytimg.com`, uploadDate, embedUrl) — voir skill seo-geo-boost.

## Timeline — factice mais vivante

- Pistes `V1` / `A1` (headers à gauche, 24px de haut chacune) ; la séquence active = un bloc clip sur V1 (dégradé violet Pr) + un bloc audio sur A1 (vert, pseudo-forme d'onde en SVG répété), **largeur proportionnelle à `duration`**.
- Règle temporelle graduée au-dessus (échelle fixe simple : 10px/s, scroll horizontal si long).
- **Tête de lecture** : trait vertical + poignée bleue. Bonus qui change tout : la synchroniser avec le player via l'API YouTube IFrame —

```ts
// Charger une seule fois : <script src="https://www.youtube.com/iframe_api">
const player = new YT.Player(iframeEl, { events: { onStateChange } });
// rAF loop quand playing : player.getCurrentTime() → position de la tête
// Clic/drag sur la règle → player.seekTo(seconds, true)
```

- Throttler la boucle (10 fps suffisent pour une tête de lecture) et la couper quand la vidéo est en pause ou l'onglet caché (`document.visibilitychange`).

## Données `duration`

- Stockée en texte `mm:ss` (affichage chutier) ; helper `durationToSeconds()` pour la timeline. Récupérée à l'insertion côté admin (oEmbed ne la donne pas — voir skill adobe-admin-data pour la stratégie), saisie manuelle en fallback.
