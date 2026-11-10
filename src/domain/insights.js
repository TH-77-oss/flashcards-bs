// Statistiques avancées (fonctions pures) : cartes difficiles, progression de
// la maîtrise avec projection, suivi du planning, objectif de 30 min, couverture.
// Elles portent sur tout l'historique depuis le 9 novembre.
// Les cartes d'EXEMPLE (chapitres sans contenu réel) sont exclues.
import { isCardMastered } from './mastery.js'
import { periodDays } from './dashboard.js'
import { EXAM_DATE, MS_PER_DAY, dayKey, startOfDay } from '../lib/dates.js'

const GOAL_MS = 30 * 60 * 1000

const realCards = (cards) => cards.filter((c) => !c.deleted && c.source !== 'seed')

function answersByCard(answers, ids) {
  const map = new Map()
  for (const a of [...answers].sort((x, y) => x.answeredAt - y.answeredAt)) {
    if (ids && !ids.has(a.cardId)) continue
    if (!map.has(a.cardId)) map.set(a.cardId, [])
    map.get(a.cardId).push(a)
  }
  return map
}

/* ---------- 2. Cartes difficiles ---------- */
// Une carte est « difficile » si elle a déjà été ratée et n'est pas maîtrisée.
// Score : chaque erreur compte double, chaque bonne réponse retire 1 point,
// et une dernière réponse fausse ajoute 2 points (difficulté actuelle).
export function difficultCards(cards, answers, limit = 20) {
  const byId = new Map(cards.filter((c) => !c.deleted).map((c) => [c.id, c]))
  const list = []
  for (const [cardId, hist] of answersByCard(answers, new Set(byId.keys()))) {
    const wrong = hist.filter((a) => !a.correct).length
    if (wrong === 0 || isCardMastered(hist)) continue
    const good = hist.length - wrong
    const last = hist[hist.length - 1]
    const score = wrong * 2 - good + (last.correct ? 0 : 2)
    if (score <= 0) continue
    list.push({ card: byId.get(cardId), wrong, good, attempts: hist.length, rate: Math.round((100 * good) / hist.length), lastWrong: !last.correct, lastAt: last.answeredAt, score })
  }
  return list.sort((a, b) => b.score - a.score || a.rate - b.rate).slice(0, limit)
}

/* ---------- 3. Progression de la maîtrise et projection ---------- */
export function masteryTimeline(cards, answers, today = new Date()) {
  const active = realCards(cards)
  const total = active.length
  const byCard = answersByCard(answers, new Set(active.map((c) => c.id)))
  const points = periodDays('all', today).map((day) => {
    let mastered = 0
    for (const hist of byCard.values()) {
      const upTo = hist.filter((a) => a.day <= day)
      if (upTo.length >= 3 && isCardMastered(upTo)) mastered++
    }
    return { day, mastered, pct: total ? (100 * mastered) / total : 0 }
  })

  const current = points.length ? points[points.length - 1].mastered : 0
  const daysLeft = Math.max(0, Math.round((EXAM_DATE - startOfDay(today)) / MS_PER_DAY))
  // Rythme récent : cartes maîtrisées par jour sur les 7 derniers jours.
  const weekAgo = points.length > 7 ? points[points.length - 8].mastered : null
  const pace = weekAgo === null ? null : (current - weekAgo) / 7
  const projected = pace === null ? null : Math.min(total, Math.round(current + pace * daysLeft))
  // Il faut au moins 7 jours pour maîtriser une carte : une carte jamais
  // maîtrisée doit l'être au plus tard 7 jours avant l'examen.
  const usefulDays = Math.max(1, daysLeft - 7)
  const required = total > current ? (total - current) / usefulDays : 0

  return { points, total, current, pace, projected, required, daysLeft }
}

/* ---------- 4. Suivi du planning et objectif de 30 min ---------- */
export function planAdherence(planned, today = new Date()) {
  const t = dayKey(today)
  const past = planned.filter((p) => p.day < t)
  const done = past.filter((p) => p.status === 'done').length
  const todayList = planned.filter((p) => p.day === t)
  return {
    pastTotal: past.length,
    pastDone: done,
    missed: past.length - done,
    rate: past.length ? Math.round((100 * done) / past.length) : null,
    todayDone: todayList.filter((p) => p.status === 'done').length,
    todayTotal: todayList.length,
  }
}

export function goalDays(answers, reading, today = new Date()) {
  const perDay = new Map()
  for (const a of answers) perDay.set(a.day, (perDay.get(a.day) || 0) + a.durationMs)
  for (const r of reading) perDay.set(r.day, (perDay.get(r.day) || 0) + r.ms)
  const days = periodDays('all', today)
  const reached = (d) => (perDay.get(d) || 0) >= GOAL_MS

  let best = 0
  let run = 0
  for (const d of days) {
    run = reached(d) ? run + 1 : 0
    best = Math.max(best, run)
  }
  // Série en cours : aujourd'hui ne la casse pas tant que la journée n'est pas finie.
  let current = 0
  let i = days.length - 1
  if (i >= 0 && !reached(days[i])) i--
  while (i >= 0 && reached(days[i])) {
    current++
    i--
  }
  return { reachedDays: days.filter(reached).length, elapsedDays: days.length, current, best }
}

/* ---------- 5. Couverture du cours ---------- */
export function coverage(chapters, cards, answers, readSet, hasCourse) {
  const seen = new Set(answers.map((a) => a.cardId))
  const active = realCards(cards)
  return chapters.map((ch) => {
    const list = active.filter((c) => c.chapterId === ch.id)
    const seenCount = list.filter((c) => seen.has(c.id)).length
    return {
      id: ch.id,
      title: ch.title,
      cards: list.length,
      seen: seenCount,
      seenPct: list.length ? Math.round((100 * seenCount) / list.length) : 0,
      hasCourse: hasCourse(ch.id),
      read: readSet.has(ch.id),
    }
  })
}
