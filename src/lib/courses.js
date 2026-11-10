// Synthèses de cours (mode « Cours »), une par chapitre : src/content/cours/ch01.json…
// Comme pour les cartes, ajouter un fichier dans ce dossier suffit.
const FILES = import.meta.glob('../content/cours/ch*.json', { eager: true, import: 'default' })
const COURSES = new Map(Object.values(FILES).map((c) => [c.chapter, c]))

export function getCourse(chapterId) {
  return COURSES.get(chapterId) || null
}

// Identifiants des cartes rattachées à une partie du cours.
export function sectionCardIds(chapterId, sectionId) {
  const section = getCourse(chapterId)?.sections.find((s) => s.id === sectionId)
  return section ? new Set(section.cards) : null
}
