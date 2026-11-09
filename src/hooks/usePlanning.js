// Lecture du planning pour l'interface.
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db.js'

export function usePlanning() {
  return useLiveQuery(async () => {
    const [planned, chapters] = await Promise.all([db.plannedSessions.toArray(), db.chapters.orderBy('id').toArray()])
    const byDay = new Map()
    for (const p of planned) {
      if (!byDay.has(p.day)) byDay.set(p.day, [])
      byDay.get(p.day).push(p)
    }
    const order = { decouverte: 0, revision: 1, consolidation: 2, globale: 3 }
    for (const list of byDay.values()) list.sort((a, b) => order[a.kind] - order[b.kind] || (a.chapterId || 0) - (b.chapterId || 0))
    return { planned, byDay, chapters, titles: new Map(chapters.map((c) => [c.id, c.title])) }
  }, [])
}
