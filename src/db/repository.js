// Écritures dans la base : toutes les modifications de données passent ici.
import { db } from './db.js'
import { newId } from '../lib/id.js'
import { dayKey } from '../lib/dates.js'

/* ---------- Sessions et réponses ---------- */

// Une session réellement effectuée (distincte des sessions *prévues* du planning).
export function startSession(id, chapterId) {
  return db.sessions.add({ id, chapterId, startedAt: Date.now(), endedAt: null, plannedSessionId: null })
}

export function endSession(id) {
  return db.sessions.update(id, { endedAt: Date.now() })
}

// Une réponse = une ligne. Elle est écrite immédiatement : si vous quittez
// au milieu d'une session, les réponses déjà données sont conservées.
export function recordAnswer({ sessionId, card, correct, durationMs }) {
  const now = Date.now()
  return db.answers.add({
    id: newId(),
    sessionId,
    cardId: card.id,
    chapterId: card.chapterId,
    correct,
    durationMs,
    answeredAt: now,
    day: dayKey(now),
  })
}

/* ---------- Temps d'utilisation ---------- */

export function addAppTime(ms, date = new Date()) {
  const day = dayKey(date)
  return db.transaction('rw', db.usageDaily, async () => {
    const row = await db.usageDaily.get(day)
    await db.usageDaily.put({ day, appMs: (row?.appMs || 0) + ms })
  })
}

/* ---------- Cartes ---------- */

// Crée ou met à jour une carte. editedByUser protège la carte : une future
// mise à jour du contenu (fichiers JSON des chapitres) ne l'écrasera pas.
export function saveCard(card) {
  return db.cards.put({ ...card, updatedAt: Date.now(), editedByUser: true })
}

// Suppression « douce » : la carte est marquée deleted, pas effacée.
// Ainsi elle ne réapparaît pas au prochain lancement, et l'historique
// de vos réponses passées reste cohérent.
export async function deleteCard(card) {
  await db.cards.update(card.id, { deleted: true, updatedAt: Date.now(), editedByUser: true })
  if (card.imageId) await deleteImage(card.imageId)
}

/* ---------- Images ---------- */

export async function saveImage({ blob, width, height }) {
  const id = newId()
  await db.images.add({ id, blob, width, height, createdAt: Date.now() })
  return id
}

export function deleteImage(id) {
  return db.images.delete(id)
}
