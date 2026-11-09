// Règle de maîtrise d'une carte (validée ensemble) :
//   les dernières réponses sont justes au moins 3 fois de suite,
//   sur au moins 3 jours différents,
//   et au moins 7 jours séparent la première de la dernière de cette série.
// Une seule erreur remet la série à zéro.
import { dayDiff } from '../lib/dates.js'

export const MASTERY = { minCorrect: 3, minDistinctDays: 3, minSpanDays: 7 }

// cardAnswers : réponses d'UNE carte, triées de la plus ancienne à la plus récente.
export function isCardMastered(cardAnswers) {
  const streak = [] // série de bonnes réponses en partant de la plus récente
  for (let i = cardAnswers.length - 1; i >= 0; i--) {
    if (!cardAnswers[i].correct) break
    streak.push(cardAnswers[i])
  }
  if (streak.length < MASTERY.minCorrect) return false

  const days = new Set(streak.map((a) => a.day))
  if (days.size < MASTERY.minDistinctDays) return false

  const firstDay = streak[streak.length - 1].day
  const lastDay = streak[0].day
  return dayDiff(firstDay, lastDay) >= MASTERY.minSpanDays
}
