// Écritures dans la base : toutes les modifications de données passent ici.
import { db } from './db.js'
import { newId } from '../lib/id.js'
import { dayKey } from '../lib/dates.js'

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

// Ajoute du temps passé dans l'app au total du jour.
export function addAppTime(ms, date = new Date()) {
  const day = dayKey(date)
  return db.transaction('rw', db.usageDaily, async () => {
    const row = await db.usageDaily.get(day)
    await db.usageDaily.put({ day, appMs: (row?.appMs || 0) + ms })
  })
}
