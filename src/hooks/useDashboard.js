// Toutes les données du dashboard pour une période donnée.
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db.js'
import { computeStats } from '../domain/stats.js'
import { periodDays, dailySeries, heatmap, streaks, chapterHistory } from '../domain/dashboard.js'
import { dayKey } from '../lib/dates.js'

async function loadAll() {
  const [chapters, cards, answers, sessions, usageDaily, reading] = await Promise.all([
    db.chapters.orderBy('id').toArray(),
    db.cards.toArray(),
    db.answers.toArray(),
    db.sessions.toArray(),
    db.usageDaily.toArray(),
    db.readingTime.toArray(),
  ])
  return { chapters, cards, answers, sessions, usageDaily, reading }
}

export function useDashboard(periodKey) {
  return useLiveQuery(async () => {
    const data = await loadAll()
    const days = periodDays(periodKey)
    const inPeriod = new Set(days)
    const answers = data.answers.filter((a) => inPeriod.has(a.day))
    const withAnswers = new Set(answers.map((a) => a.sessionId))
    const sessions = data.sessions.filter((s) => withAnswers.has(s.id) && inPeriod.has(dayKey(s.startedAt)))

    const overall = computeStats(data) // la maîtrise se juge sur tout l'historique
    const period = computeStats({ ...data, answers, sessions })
    const appMs = data.usageDaily.filter((u) => inPeriod.has(u.day)).reduce((t, u) => t + u.appMs, 0)
    const reading = data.reading.filter((r) => inPeriod.has(r.day))
    const readMs = reading.reduce((t, r) => t + r.ms, 0)

    return {
      kpi: { ...period, appMs, readMs, cardsRemaining: overall.cardsRemaining, cardsMastered: overall.cardsMastered },
      daily: dailySeries(days, answers, sessions, data.usageDaily, reading),
      heat: heatmap(data.answers),
      streak: streaks(data.answers),
      chapters: period.chapters,
    }
  }, [periodKey])
}

export function useChapterDashboard(chapterId) {
  return useLiveQuery(async () => {
    const data = await loadAll()
    const stats = computeStats(data)
    return {
      chapter: stats.chapters.find((c) => c.id === chapterId) || null,
      history: chapterHistory(chapterId, data.answers),
      cardMs: data.answers.filter((a) => a.chapterId === chapterId).reduce((t, a) => t + a.durationMs, 0),
      readMs: data.reading.filter((r) => r.chapterId === chapterId).reduce((t, r) => t + r.ms, 0),
    }
  }, [chapterId])
}
