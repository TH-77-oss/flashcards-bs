// Tout ce qui concerne les dates du projet, au même endroit.
// Attention : en JavaScript les mois commencent à 0 (0 = janvier, 10 = novembre).
export const START_DATE = new Date(2026, 10, 9) // 9 novembre 2026
export const EXAM_DATE = new Date(2027, 1, 1) // 1er février 2027
export const EXAM_DATE_LABEL = '1er février 2027'

export const MS_PER_DAY = 24 * 60 * 60 * 1000

// Ramène une date à minuit, pour comparer des jours et non des heures.
export function startOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// Nombre de jours restants avant l'examen (jamais négatif).
// Math.round absorbe le décalage d'une heure lié au changement d'heure.
export function daysUntilExam(today = new Date()) {
  return Math.max(0, Math.round((EXAM_DATE - startOfDay(today)) / MS_PER_DAY))
}

// Identifiant d'un jour en heure locale (Paris) : "2026-11-09".
// Toutes les statistiques « par jour » se regroupent sur cette clé.
export function dayKey(date = new Date()) {
  const d = new Date(date)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function parseDayKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Nombre de jours entre deux clés de jour (b - a).
export function dayDiff(a, b) {
  return Math.round((parseDayKey(b) - parseDayKey(a)) / MS_PER_DAY)
}

// 1 500 000 ms → "25 min" ; 4 800 000 ms → "1 h 20"
export function formatDuration(ms) {
  const min = Math.round(ms / 60000)
  if (min < 60) return `${min} min`
  return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`
}
