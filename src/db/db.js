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

// Version 2 (étape 7) : ajout du planning. Dexie met à jour la base déjà
// présente sur l'appareil sans toucher aux données existantes.
db.version(2).stores({
  chapters: 'id',
  cards: 'id, chapterId',
  sessions: 'id, chapterId, startedAt',
  answers: 'id, sessionId, cardId, chapterId, day',
  usageDaily: 'day',
  images: 'id',
  settings: 'key',
  // { id, day, chapterId (null = tous), kind, minutes, status: 'planned'|'done',
  //   generated, editedManually, doneSessionId, createdAt }
  plannedSessions: 'id, day, chapterId, status',
})

// Version 3 : vos notes personnelles, une par carte. Elles sont dans une table
// à part : les mises à jour du contenu des chapitres ne les touchent jamais.
db.version(3).stores({
  chapters: 'id',
  cards: 'id, chapterId',
  sessions: 'id, chapterId, startedAt',
  answers: 'id, sessionId, cardId, chapterId, day',
  usageDaily: 'day',
  images: 'id',
  settings: 'key',
  plannedSessions: 'id, day, chapterId, status',
  notes: 'cardId, updatedAt', // { cardId, text, updatedAt }
})

// Version 4 : temps de lecture du mode « Cours », par jour et par chapitre.
db.version(4).stores({
  chapters: 'id',
  cards: 'id, chapterId',
  sessions: 'id, chapterId, startedAt',
  answers: 'id, sessionId, cardId, chapterId, day',
  usageDaily: 'day',
  images: 'id',
  settings: 'key',
  plannedSessions: 'id, day, chapterId, status',
  notes: 'cardId, updatedAt',
  readingTime: 'id, day, chapterId', // { id: "2026-11-10|3", day, chapterId, ms }
})

// Fichiers de contenu des chapitres (src/content/ch01.json, ch02.json…).
// Vite les intègre à l'app au moment de la compilation : ajouter un fichier
// dans ce dossier suffit pour qu'il soit pris en compte au prochain lancement.
const CONTENT = Object.values(import.meta.glob('../content/ch*.json', { eager: true, import: 'default' }))

// Fusionne le contenu des chapitres dans la base, sans jamais écraser vos modifications :
//  - carte absente → ajoutée ;
//  - carte présente, non modifiée par vous, et dont le fichier a changé de version → mise à jour ;
//  - carte modifiée ou supprimée par vous (editedByUser) → laissée telle quelle ;
//  - cartes d'exemple du chapitre, et cartes retirées du fichier → marquées supprimées.
// Votre historique de réponses reste rattaché aux mêmes identifiants de cartes.
async function syncContent() {
  for (const pack of CONTENT) {
    await db.transaction('rw', db.chapters, db.cards, async () => {
      const now = Date.now()
      await db.chapters.update(pack.chapter, { title: pack.title })

      const ids = pack.cards.map((c) => c.id)
      const current = await db.cards.bulkGet(ids)
      for (let i = 0; i < pack.cards.length; i++) {
        const c = pack.cards[i]
        const cur = current[i]
        const fields = {
          chapterId: pack.chapter,
          category: c.category,
          question: c.question,
          answer: c.answer,
          image: c.image || null,
          imageHint: c.imageHint || null,
          contentVersion: pack.version,
        }
        if (!cur) {
          await db.cards.add({ id: c.id, ...fields, imageId: null, source: 'content', deleted: false, createdAt: now, updatedAt: now })
        } else if (!cur.editedByUser && cur.contentVersion !== pack.version) {
          await db.cards.update(c.id, { ...fields, updatedAt: now })
        }
      }

      const inPack = new Set(ids)
      const chapterCards = await db.cards.where('chapterId').equals(pack.chapter).toArray()
      for (const cur of chapterCards) {
        const obsolete = cur.source === 'seed' || (cur.source === 'content' && !inPack.has(cur.id))
        if (obsolete && !cur.editedByUser && !cur.deleted) await db.cards.update(cur.id, { deleted: true, updatedAt: now })
      }
    })
  }
}

// Appelé au démarrage : insère les chapitres et cartes de départ manquants,
// intègre le contenu des chapitres, puis demande au navigateur de protéger
// les données contre l'effacement.
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

  await syncContent()

  if (navigator.storage?.persist) {
    try {
      await navigator.storage.persist()
    } catch {
      // Pas grave : la sauvegarde JSON reste la vraie assurance.
    }
  }
}
