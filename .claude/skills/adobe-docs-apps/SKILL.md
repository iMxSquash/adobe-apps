---
name: adobe-docs-apps
description: Spécifications des apps documents Photoshop et Illustrator — canvas (damier vs plan de travail), zoom/pan, panneau Calques (vignette, layer_name, œil), description en commentaire (panneau + épingle sur le canvas), onglets multi-fichiers. À utiliser pour tout travail sur l'affichage des œuvres dans Photoshop ou Illustrator.
---

# Photoshop & Illustrator — les apps « documents »

Un « fichier » = une ligne `artworks` : `image_url` (l'œuvre), `layer_name` (panneau Calques), `description` (le commentaire), `title` (nom du fichier), `width/height`. **Photoshop et Illustrator partagent tous les mécanismes** — seuls l'habillage et quelques rendus diffèrent. Implémenter dans `components/adobe/document/`, spécialiser par props/thème, jamais par copier-coller.

## Différences Ps / Ai (tout le reste est commun)

|                         | Photoshop                                                                                                                      | Illustrator                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Fond du canvas          | **damier de transparence** (carrés 8px `#ffffff`/`#cccccc` — CSS `conic-gradient` répété), l'image posée dessus avec une ombre | zone de travail grise `#4b4b4b`, **plan de travail blanc** aux dimensions de l'œuvre, libellé « Plan de travail 1 » au-dessus en 10px |
| Extension d'onglet      | `titre.psd`                                                                                                                    | `titre.ai`                                                                                                                            |
| Accent / icônes toolbar | bleu `#31A8FF`, outils Ps (déplacement, lasso, recadrage, texte, main)                                                         | orange `#FF9A00`, outils Ai (sélection, sélection directe, plume, forme, texte)                                                       |
| Panneaux droits         | Calques, Commentaires, Propriétés                                                                                              | Calques, Commentaires, Nuancier (factice)                                                                                             |

## Canvas — zoom et pan

- État **par document** (pas global) : `{ zoom, panX, panY, layerVisible }` — conservé quand on change d'onglet.
- Zoom : `Cmd/Ctrl + molette` centré sur le curseur, boutons +/− et menu % dans la status bar, bornes 10–400 %, paliers macOS-like (25, 33, 50, 66, 100, 200…). `fit` par défaut à l'ouverture (l'œuvre entière visible avec une marge).
- Pan : drag à la souris (espace + drag pour la fidélité, ou drag direct), inertie inutile.
- Rendu : l'image dans un conteneur `transform: translate(pan) scale(zoom)` avec `transform-origin` géré — pas de re-layout. `image-rendering: pixelated` au-delà de 200 % (fidélité Photoshop).
- L'image vient de Supabase Storage : `next/image` avec `sizes` correct, placeholder blur si possible.

## Panneau Calques — le détail qui vend l'illusion

Deux lignes, fidèles au vrai panneau :

1. **Le calque de l'œuvre** : vignette 32×32 de l'image (object-fit cover, bord 1px), le **`layer_name`** en 11px, **œil de visibilité cliquable qui masque réellement l'image** sur le canvas (le damier/plan de travail reste visible — c'est LE détail qui fait mouche). Ligne sélectionnée = fond `--accent` à ~30 %.
2. **« Arrière-plan »** : vignette blanche, nom en italique, cadenas 🔒, non cliquable.

En-tête du panneau : mode de fusion « Normal » + « Opacité : 100 % » (selects factices mais stylés). Double-clic sur le nom du calque : ne rien renommer (lecture seule) — petit shake ou rien.

## La description = un commentaire de collaboration Adobe

Double représentation, comme la vraie fonctionnalité « Commentaires » :

- **Panneau Commentaires** : un commentaire unique — avatar (initiale « E »), **Elwen**, date relative (« il y a 3 j » depuis `created_at`), puis le texte `description`. Champ « Répondre » factice désactivé.
- **Épingle sur le canvas** : pastille numérotée ① posée sur l'œuvre (position fixe en % de l'image, ex. coin supérieur droit ; elle suit zoom/pan puisqu'elle vit DANS le conteneur transformé). Clic → bulle popover avec le même commentaire ; clic ailleurs la ferme. L'épingle pulse doucement à l'ouverture du document pour attirer l'œil.
- Le texte de `description` est du **texte brut** (échappé par JSX) — jamais de HTML injecté (règle check-security).

## Onglets multi-fichiers

- Toutes les œuvres de l'app sont ouvrables simultanément ; état zoom/pan/œil conservé par onglet (les documents inactifs restent montés, `display: none` — pas de démontage).
- Fermer le dernier onglet → retour `<HomeScreen>`.
- Barre de titre du document (au-dessus du canvas, 11px) : `titre.psd @ 67 % (Calque : {layer_name})` — fidélité Photoshop.
- Status bar : `{zoom} %` + `{width} × {height} px`.

## SEO du document (skill seo-geo-boost en complément)

- Chaque œuvre a une **URL propre** (`/[slug]` sur son sous-domaine) rendue serveur : title/description/OG depuis `artworks`, JSON-LD `VisualArtwork`/`ImageObject`. L'UI ouvre les onglets client-side, mais l'URL directe rend le document complet.
