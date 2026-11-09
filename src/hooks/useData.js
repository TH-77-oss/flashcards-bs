// Lecture des données pour l'interface. useLiveQuery (Dexie) relance la
// requête automatiquement dès que les tables concernées changent : l'écran
// se met à jour tout seul après chaque réponse ou modification.
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

export function useChapters() {
  return useLiveQuery(() => db.chapters.orderBy('id').toArray(), [])
}

// chapterId null = révision globale (pas de chapitre précis).
export function useChapter(chapterId) {
  return useLiveQuery(() => (chapterId == null ? null : db.chapters.get(chapterId)), [chapterId])
}

// Cartes d'une session : celles d'un chapitre, ou toutes (révision globale).
export function useSessionCards(chapterId) {
  return useLiveQuery(
    () =>
      (chapterId == null ? db.cards.toCollection() : db.cards.where('chapterId').equals(chapterId))
        .filter((c) => !c.deleted)
        .toArray(),
    [chapterId],
  )
}

export function useChapterCards(chapterId) {
  return useLiveQuery(
    () => db.cards.where('chapterId').equals(chapterId).filter((c) => !c.deleted).toArray(),
    [chapterId],
  )
}

// Une carte par son id. Renvoie undefined pendant le chargement,
// null si la carte n'existe pas (ou a été supprimée).
export function useCard(id) {
  return useLiveQuery(
    () => (id ? db.cards.get(id).then((c) => (c && !c.deleted ? c : null)) : null),
    [id],
  )
}
