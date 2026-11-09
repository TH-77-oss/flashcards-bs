// Calcul de toutes les statistiques à partir des réponses réellement données.
// Fonctions « pures » : mêmes données en entrée → mêmes résultats, sans
// toucher à la base. Faciles à tester et à faire évoluer.
import { isCardMastered } from './mastery.js'
import { dayKey } from '../lib/dates.js'

export function rateOf(good, total) {
  return total ? Math.round((100 * good) / total) : null
}

export function computeStats({ chapters, cards, answers, sessions, usageDaily }) {
  const activeCards = cards.filter((c) => !c.deleted)
  const sorted = [...answers].sort((a, b) => a.answeredAt - b.answeredAt)

  // Réponses regroupées par carte (pour la maîtrise)
  const byCard = new Map()
  for (const a of sorted) {
    if (!byCard.has(a.cardId)) byCard.set(a.cardId, [])
    byCard.get(a.cardId).push(a)
  }
  const mastered = new Set(activeCards.filter((c) => isCardMastered(byCard.get(c.id) || [])).map((c) => c.id))

  // Par chapitre
  const perChapter = new Map(
    chapters.map((ch) => [ch.id, { id: ch.id, title: ch.title, cards: 0, mastered: 0, attempts: 0, good: 0, sessions: 0 }]),
  )
  for (const c of activeCards) {
    const ch = perChapter.get(c.chapterId)
    if (!ch) continue
    ch.cards++
    if (mastered.has(c.id)) ch.mastered++
  }
  for (const a of sorted) {
    const ch = perChapter.get(a.chapterId)
    if (!ch) continue
    ch.attempts++
    if (a.correct) ch.good++
  }
  const sessionsWithAnswers = new Set(sorted.map((a) => a.sessionId))
  const realSessions = sessions.filter((s) => sessionsWithAnswers.has(s.id))
  for (const s of realSessions) {
    const ch = perChapter.get(s.chapterId)
    if (ch) ch.sessions++
  }
  for (const ch of perChapter.values()) {
    ch.rate = rateOf(ch.good, ch.attempts)
    ch.masteryPct = ch.cards ? Math.round((100 * ch.mastered) / ch.cards) : 0
    ch.isMastered = ch.cards > 0 && ch.mastered === ch.cards
  }

  // Global
  const good = sorted.filter((a) => a.correct).length
  const today = dayKey()
  const studyMsToday = sorted.filter((a) => a.day === today).reduce((t, a) => t + a.durationMs, 0)
  const appMsToday = usageDaily.find((u) => u.day === today)?.appMs || 0
  const chapterList = [...perChapter.values()]

  return {
    total: sorted.length,
    good,
    bad: sorted.length - good,
    rate: rateOf(good, sorted.length),
    sessions: realSessions.length,
    daysStudied: new Set(sorted.map((a) => a.day)).size,
    chaptersWorked: chapterList.filter((c) => c.attempts > 0).length,
    cardsTotal: activeCards.length,
    cardsMastered: mastered.size,
    cardsRemaining: activeCards.length - mastered.size,
    studyMsTotal: sorted.reduce((t, a) => t + a.durationMs, 0),
    studyMsToday,
    appMsToday,
    chapters: chapterList,
    nextChapter: chapterList.find((c) => c.attempts === 0) || chapterList[0],
  }
}
