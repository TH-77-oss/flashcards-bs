// Calculs propres au dashboard : séries par jour, heatmap, séries de jours
// consécutifs, historique d'un chapitre. Fonctions pures, comme stats.js.
import { START_DATE, dayKey, startOfDay } from '../lib/dates.js'

export const PERIODS = [
  { key: '7', label: '7 jours', days: 7 },
  { key: '30', label: '30 jours', days: 30 },
  { key: 'all', label: 'Tout', days: null },
]

function addDays(date, n) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n)
}

// Liste des clés de jour ("2026-11-09"…) couvertes par une période, jusqu'à aujourd'hui.
// La période ne remonte jamais avant le début des révisions (9 novembre).
export function periodDays(periodKey, today = new Date()) {
  const end = startOfDay(today)
  const period = PERIODS.find((p) => p.key === periodKey) || PERIODS[2]
  let start = period.days ? addDays(end, -(period.days - 1)) : START_DATE
  if (start < START_DATE) start = START_DATE
  if (start > end) start = end
  const days = []
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(dayKey(d))
  return days
}

// Une ligne par jour : cartes révisées, bonnes réponses, taux, temps, sessions.
// reading : temps de lecture du cours ({ day, chapterId, ms }).
export function dailySeries(days, answers, sessions, usageDaily, reading = []) {
  const rows = new Map(days.map((d) => [d, { day: d, cards: 0, good: 0, studyMs: 0, readMs: 0, appMs: 0, sessions: 0 }]))
  for (const a of answers) {
    const r = rows.get(a.day)
    if (!r) continue
    r.cards++
    if (a.correct) r.good++
    r.studyMs += a.durationMs
  }
  for (const r of reading) {
    const row = rows.get(r.day)
    if (row) row.readMs += r.ms
  }
  for (const u of usageDaily) {
    const r = rows.get(u.day)
    if (r) r.appMs = u.appMs
  }
  for (const s of sessions) {
    const r = rows.get(dayKey(s.startedAt))
    if (r) r.sessions++
  }
  return [...rows.values()].map((r) => ({ ...r, rate: r.cards ? Math.round((100 * r.good) / r.cards) : null }))
}

// Heatmap de régularité : les 12 semaines du 9 novembre au 31 janvier.
// Intensité 0 (rien) à 4 (beaucoup), -1 pour les jours à venir.
export function heatmap(answers, today = new Date()) {
  const counts = new Map()
  for (const a of answers) counts.set(a.day, (counts.get(a.day) || 0) + 1)
  const todayKey = dayKey(today)
  const cells = []
  for (let i = 0; i < 84; i++) {
    const day = dayKey(addDays(START_DATE, i))
    const count = counts.get(day) || 0
    const future = day > todayKey // les clés "AAAA-MM-JJ" se comparent comme du texte
    cells.push({ day, count, level: future ? -1 : levelOf(count) })
  }
  return cells
}

function levelOf(n) {
  if (n === 0) return 0
  if (n < 15) return 1
  if (n < 30) return 2
  if (n < 50) return 3
  return 4
}

// Série en cours (jours consécutifs avec au moins une réponse) et record.
// Aujourd'hui sans réponse ne casse pas encore la série : la journée n'est pas finie.
export function streaks(answers, today = new Date()) {
  const studied = new Set(answers.map((a) => a.day))
  let current = 0
  let d = startOfDay(today)
  if (!studied.has(dayKey(d))) d = addDays(d, -1)
  while (studied.has(dayKey(d))) {
    current++
    d = addDays(d, -1)
  }
  let best = 0
  let run = 0
  for (let x = START_DATE; x <= startOfDay(today); x = addDays(x, 1)) {
    run = studied.has(dayKey(x)) ? run + 1 : 0
    best = Math.max(best, run)
  }
  return { current, best: Math.max(best, current) }
}

// Historique d'un chapitre : une ligne par session, de la plus ancienne à la plus récente.
export function chapterHistory(chapterId, answers) {
  const bySession = new Map()
  for (const a of answers) {
    if (a.chapterId !== chapterId) continue
    if (!bySession.has(a.sessionId)) bySession.set(a.sessionId, { sessionId: a.sessionId, at: a.answeredAt, cards: 0, good: 0, studyMs: 0 })
    const s = bySession.get(a.sessionId)
    s.at = Math.min(s.at, a.answeredAt)
    s.cards++
    if (a.correct) s.good++
    s.studyMs += a.durationMs
  }
  return [...bySession.values()]
    .map((s) => ({ ...s, rate: Math.round((100 * s.good) / s.cards) }))
    .sort((a, b) => a.at - b.at)
}
