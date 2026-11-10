// Écritures dans la base : toutes les modifications de données passent ici.
import { db } from './db.js'
import { newId } from '../lib/id.js'
import { dayKey } from '../lib/dates.js'

/* ---------- Sessions et réponses ---------- */

// Une session réellement effectuée (distincte des sessions *prévues* du planning).
// chapterId vaut null pour une révision globale (tous les chapitres).
// Si une session était prévue aujourd'hui pour ce chapitre, elle est
// automatiquement marquée « réalisée » et reliée à cette vraie session.
export async function startSession(id, chapterId) {
  const today = dayKey()
  const planned = await db.plannedSessions
    .where('day')
    .equals(today)
    .filter((p) => p.status === 'planned' && (chapterId === null ? p.kind === 'globale' : p.chapterId === chapterId))
    .first()
  await db.sessions.add({ id, chapterId, startedAt: Date.now(), endedAt: null, plannedSessionId: planned?.id || null })
  if (planned) await db.plannedSessions.update(planned.id, { status: 'done', doneSessionId: id })
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

/* ---------- Notes personnelles ---------- */

// Une note par carte. Enregistrer un texte vide supprime la note.
export function saveNote(cardId, text) {
  const clean = text.trim()
  if (!clean) return db.notes.delete(cardId)
  return db.notes.put({ cardId, text: clean, updatedAt: Date.now() })
}

export function deleteNote(cardId) {
  return db.notes.delete(cardId)
}

/* ---------- Temps de lecture du cours ---------- */

// Ajoute du temps de lecture au total du jour pour ce chapitre.
export function addReadingTime(chapterId, ms, date = new Date()) {
  const day = dayKey(date)
  const id = `${day}|${chapterId}`
  return db.transaction('rw', db.readingTime, async () => {
    const row = await db.readingTime.get(id)
    await db.readingTime.put({ id, day, chapterId, ms: (row?.ms || 0) + ms })
  })
}
