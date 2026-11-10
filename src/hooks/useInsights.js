// Données des statistiques avancées (tout l'historique).
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db.js'
import { difficultCards, masteryTimeline, planAdherence, goalDays, coverage } from '../domain/insights.js'
import { getCourse } from '../lib/courses.js'

export function useInsights() {
  return useLiveQuery(async () => {
    const [chapters, cards, answers, planned, reading, settings] = await Promise.all([
      db.chapters.orderBy('id').toArray(),
      db.cards.toArray(),
      db.answers.toArray(),
      db.plannedSessions.toArray(),
      db.readingTime.toArray(),
      db.settings.toArray(),
    ])
    const readSet = new Set(settings.filter((s) => s.key.startsWith('coursLu-')).map((s) => Number(s.key.slice(8))))
    return {
      hard: difficultCards(cards, answers, 20),
      mastery: masteryTimeline(cards, answers),
      plan: planAdherence(planned),
      goal: goalDays(answers, reading),
      coverage: coverage(chapters, cards, answers, readSet, (id) => !!getCourse(id)),
    }
  }, [])
}

// Les cartes difficiles seules (pour la session /session/difficiles).
export function useDifficultCards(limit = 20) {
  return useLiveQuery(async () => {
    const [cards, answers] = await Promise.all([db.cards.toArray(), db.answers.toArray()])
    return difficultCards(cards, answers, limit)
  }, [limit])
}
