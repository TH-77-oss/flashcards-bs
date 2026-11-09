// Liste provisoire des 18 chapitres. À l'étape 5, elle viendra de la base
// de données locale (IndexedDB) et les titres réels seront ajoutés.
export const CHAPTERS = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  title: `Chapitre ${i + 1}`,
}))
