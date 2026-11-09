// Base de données locale de l'app (IndexedDB, via la bibliothèque Dexie).
// Tout est stocké sur l'appareil : rien ne part sur Internet.
import Dexie from 'dexie'
import { CHAPTERS } from '../data/chapters.js'
import { buildSeedCards } from '../data/sampleCards.js'

export const db = new Dexie('flashcards-business-strategy')

// Schéma : pour chaque table, la clé primaire puis les champs indexés
// (ceux sur lesquels on fait des recherches). Les autres champs sont
// stockés aussi, simplement non indexés.
// ⚠ Pour modifier le schéma plus tard, on ajoutera db.version(2) — on ne
// modifie jamais une version déjà installée sur l'iPhone.
db.version(1).stores({
  chapters: 'id', //                       { id, title }
  cards: 'id, chapterId', //               { id, chapterId, category, question, answer, imageId, source, deleted, … }
  sessions: 'id, chapterId, startedAt', // { id, chapterId, startedAt, endedAt, plannedSessionId }
  answers: 'id, sessionId, cardId, chapterId, day', // { …, correct, durationMs, answeredAt, day }
  usageDaily: 'day', //                    { day: "2026-11-09", appMs }
  images: 'id', //                         { id, blob, width, height }  (étape 5b)
  settings: 'key', //                      { key, value }
})

// Appelé au démarrage : insère les chapitres et cartes de départ manquants,
// puis demande au navigateur de protéger les données contre l'effacement.
export async function initDb() {
  await db.transaction('rw', db.chapters, db.cards, async () => {
    const chapterIds = new Set(await db.chapters.toCollection().primaryKeys())
    const missingChapters = CHAPTERS.filter((c) => !chapterIds.has(c.id))
    if (missingChapters.length) await db.chapters.bulkAdd(missingChapters)

    // On n'ajoute que les cartes absentes : vos modifications ne sont jamais
    // écrasées, et une carte supprimée (deleted: true) ne revient pas.
    const cardIds = new Set(await db.cards.toCollection().primaryKeys())
    const missingCards = buildSeedCards().filter((c) => !cardIds.has(c.id))
    if (missingCards.length) await db.cards.bulkAdd(missingCards)
  })

  if (navigator.storage?.persist) {
    try {
      await navigator.storage.persist()
    } catch {
      // Pas grave : la sauvegarde JSON reste la vraie assurance.
    }
  }
}
