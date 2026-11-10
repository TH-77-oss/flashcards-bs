// Lecture des notes personnelles.
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db.js'

// Toutes les notes sous forme de Map(cardId → texte), pour savoir d'un coup
// d'œil quelles cartes sont annotées.
export function useNotesMap() {
  return useLiveQuery(async () => new Map((await db.notes.toArray()).map((n) => [n.cardId, n.text])), [])
}

// Toutes les notes avec leur carte, regroupées par chapitre (page « Mes notes »).
export function useNotesByChapter() {
  return useLiveQuery(async () => {
    const [notes, chapters] = await Promise.all([db.notes.toArray(), db.chapters.orderBy('id').toArray()])
    const cards = await db.cards.bulkGet(notes.map((n) => n.cardId))
    const groups = new Map(chapters.map((ch) => [ch.id, { chapter: ch, items: [] }]))
    notes.forEach((note, i) => {
      const card = cards[i]
      if (!card || card.deleted) return // carte supprimée : sa note est masquée
      groups.get(card.chapterId)?.items.push({ note, card })
    })
    const list = [...groups.values()].filter((g) => g.items.length)
    for (const g of list) g.items.sort((a, b) => a.card.id.localeCompare(b.card.id))
    return { groups: list, total: list.reduce((t, g) => t + g.items.length, 0) }
  }, [])
}
