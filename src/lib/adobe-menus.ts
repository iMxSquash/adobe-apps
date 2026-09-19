export interface AdobeMenu {
  label: string;
  /** "-" insère un séparateur. */
  items: string[];
}

export const FILE_MENU_LABEL = "Fichier";
export const CLOSE_ITEM_LABEL = "Fermer";

const FILE_MENU: AdobeMenu = {
  label: FILE_MENU_LABEL,
  items: [
    "Nouveau...",
    "Ouvrir...",
    "Ouvrir récent",
    "-",
    "Enregistrer",
    "Enregistrer sous...",
    "-",
    CLOSE_ITEM_LABEL,
  ],
};

const EDIT_MENU: AdobeMenu = {
  label: "Édition",
  items: ["Annuler", "Rétablir", "-", "Copier", "Coller", "-", "Préférences"],
};

function windowMenu(panels: string[]): AdobeMenu {
  return { label: "Fenêtre", items: [...panels, "-", "Espace de travail"] };
}

const HELP_MENU: AdobeMenu = {
  label: "Aide",
  items: ["À propos", "Documentation"],
};

export const PHOTOSHOP_MENUS: AdobeMenu[] = [
  FILE_MENU,
  EDIT_MENU,
  {
    label: "Image",
    items: ["Taille de l'image...", "Taille de la zone de travail...", "-", "Rotation"],
  },
  windowMenu(["Calques", "Propriétés", "Commentaires"]),
  HELP_MENU,
];

export const ILLUSTRATOR_MENUS: AdobeMenu[] = [
  FILE_MENU,
  EDIT_MENU,
  { label: "Objet", items: ["Transformer", "Grouper", "-", "Alignement"] },
  windowMenu(["Calques", "Commentaires", "Nuancier"]),
  HELP_MENU,
];

export const PREMIEREPRO_MENUS: AdobeMenu[] = [
  FILE_MENU,
  EDIT_MENU,
  { label: "Séquence", items: ["Nouvelle séquence...", "Réglages de séquence...", "-", "Rendu"] },
  windowMenu(["Projet", "Moniteur du programme", "Chronologie", "Effets"]),
  HELP_MENU,
];
