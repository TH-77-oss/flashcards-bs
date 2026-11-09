// Lecture des données pour l'interface. useLiveQuery (Dexie) relance la
// requête automatiquement dès que les tables concernées changent : l'écran
// se met à jour tout seul après chaque réponse.
// Pendant le premier chargement, ces hooks renvoient undefined.
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db.js'
import { computeStats } from '../domain/stats.js'

export function useStats() {
  return useLiveQuery(async () => {
    const [chapters, cards, answers, sessions, usageDaily] = await Promise.all([
      db.chapters.orderBy('id').toArray(),
      db.cards.toArray(),
      db.answers.toArray(),
      db.sessions.toArray(),
      db.usageDaily.toArray(),
    ])
    return computeStats({ chapters, cards, answers, sessions, usageDaily })
  }, [])
}

export function useChapter(chapterId) {
  return useLiveQuery(() => db.chapters.get(chapterId), [chapterId])
}

export function useChapterCards(chapterId) {
  return useLiveQuery(
    () => db.cards.where('chapterId').equals(chapterId).filter((c) => !c.deleted).toArray(),
    [chapterId],
  )
}
