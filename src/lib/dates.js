// Tout ce qui concerne les dates du projet, au même endroit.
// Attention : en JavaScript les mois commencent à 0 (0 = janvier, 10 = novembre).
export const START_DATE = new Date(2026, 10, 9) // 9 novembre 2026
export const EXAM_DATE = new Date(2027, 1, 1) // 1er février 2027
export const EXAM_DATE_LABEL = '1er février 2027'

const MS_PER_DAY = 24 * 60 * 60 * 1000

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
