// Écritures du planning : génération automatique et modifications manuelles.
// Rappel : une session PRÉVUE n'entre jamais dans les statistiques ; seules
// les réponses réellement données comptent.
import { db } from './db.js'
import { newId } from '../lib/id.js'
import { dayKey } from '../lib/dates.js'
import { computeStats } from '../domain/stats.js'
import { buildPlan, KINDS, PHASES, dayOfIndex, indexOfDay } from '../domain/scheduler.js'

// (Re)génère le planning à partir d'aujourd'hui, selon vos performances.
// Conservé tel quel : le passé, les sessions réalisées, celles modifiées à la main.
export async function regeneratePlan() {
  const [chapters, cards, answers, sessions, usageDaily, existing] = await Promise.all([
    db.chapters.orderBy('id').toArray(),
    db.cards.toArray(),
    db.answers.toArray(),
    db.sessions.toArray(),
    db.usageDaily.toArray(),
    db.plannedSessions.toArray(),
  ])
  const stats = computeStats({ chapters, cards, answers, sessions, usageDaily })

  const studyDays = new Map()
  for (const a of answers) {
    if (!studyDays.has(a.chapterId)) studyDays.set(a.chapterId, new Set())
    studyDays.get(a.chapterId).add(a.day)
  }
  for (const [k, v] of studyDays) studyDays.set(k, [...v].sort())

  const today = dayKey()
  const keep = existing.filter((p) => p.day < today || p.status === 'done' || p.editedManually)
  const toRemove = existing.filter((p) => !keep.includes(p)).map((p) => p.id)
  const fresh = buildPlan({ chapters: stats.chapters, studyDays, keep }).map((p) => ({
    ...p,
    id: newId(),
    status: 'planned',
    generated: true,
    editedManually: false,
    doneSessionId: null,
    createdAt: Date.now(),
  }))

  await db.transaction('rw', db.plannedSessions, db.settings, async () => {
    await db.plannedSessions.bulkDelete(toRemove)
    await db.plannedSessions.bulkAdd(fresh)
    await db.settings.put({ key: 'planGeneratedAt', value: Date.now() })
  })
}

// Au premier affichage du Planning : génère le planning s'il n'existe pas encore.
// La promesse partagée évite une double génération si la page s'affiche deux fois
// de suite (ce que fait React en mode développement).
let pending = null
export function ensurePlan() {
  if (!pending) {
    pending = (async () => {
      const done = await db.settings.get('planGeneratedAt')
      if (!done) await regeneratePlan()
    })()
  }
  return pending
}

export function addPlannedSession({ day, chapterId, kind, minutes }) {
  return db.plannedSessions.add({
    id: newId(),
    day,
    chapterId: kind === 'globale' ? null : chapterId,
    kind,
    minutes: minutes || KINDS[kind].minutes,
    status: 'planned',
    generated: false,
    editedManually: true,
    doneSessionId: null,
    createdAt: Date.now(),
  })
}

export function updatePlannedSession(id, changes) {
  const fixed = { ...changes }
  if (fixed.kind === 'globale') fixed.chapterId = null
  return db.plannedSessions.update(id, { ...fixed, editedManually: true })
}

export function deletePlannedSession(id) {
  return db.plannedSessions.delete(id)
}

export function toggleDone(p) {
  return db.plannedSessions.update(p.id, { status: p.status === 'done' ? 'planned' : 'done', editedManually: true })
}

export function postpone(p) {
  const next = Math.min(PHASES.lastDay, indexOfDay(p.day) + 1)
  return db.plannedSessions.update(p.id, { day: dayOfIndex(next), editedManually: true })
}
