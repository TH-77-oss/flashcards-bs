// Générateur de planning en répétition espacée. Fonction pure : à partir de
// vos performances et de la date du jour, il propose les sessions à venir.
//
// Les phases (comptées en jours depuis le 9 novembre) :
//   jours 0 → 48   (→ 27 déc.)  découverte progressive des chapitres + révisions espacées
//   jours 49 → 69  (→ 17 janv.) révisions espacées uniquement
//   jours 70 → 83  (→ 31 janv.) consolidation, chapitres faibles en priorité, + révisions globales
//   jour 84        (1er fév.)   examen
import { START_DATE, MS_PER_DAY, dayKey, parseDayKey } from '../lib/dates.js'

export const PHASES = { discoveryEnd: 48, reviewEnd: 69, consolidationStart: 70, lastDay: 83, exam: 84 }

export const KINDS = {
  decouverte: { label: 'Découverte', minutes: 20 },
  revision: { label: 'Révision', minutes: 10 },
  consolidation: { label: 'Consolidation', minutes: 15 },
  globale: { label: 'Révision globale', minutes: 30 },
}

export const DAILY_BUDGET_MIN = 30
const TOLERANCE_MIN = 10 // on accepte jusqu'à 40 min un jour chargé
const INTERVALS = [1, 3, 7, 14, 30] // écarts entre deux révisions d'un chapitre (en jours)

export const indexOfDay = (key) => Math.round((parseDayKey(key) - START_DATE) / MS_PER_DAY)
export const dayOfIndex = (i) => dayKey(new Date(START_DATE.getFullYear(), START_DATE.getMonth(), START_DATE.getDate() + i))

// Un chapitre faible revient plus vite, un chapitre bien maîtrisé s'espace.
export function performanceFactor(ch) {
  if (!ch.attempts) return 1
  if (ch.rate < 60) return 0.6
  if (ch.rate >= 85 && ch.masteryPct >= 50) return 1.5
  return 1
}

// Plus le score est haut, plus le chapitre a besoin de consolidation.
function weakness(ch) {
  return (ch.attempts ? 100 - ch.rate : 100) + (100 - ch.masteryPct)
}

/**
 * chapters  : statistiques par chapitre [{ id, attempts, rate, masteryPct }]
 * studyDays : Map(chapterId → liste triée des jours où il a été révisé)
 * keep      : sessions futures à conserver telles quelles (réalisées ou modifiées à la main)
 * Renvoie   : [{ day, chapterId, kind, minutes }]
 */
export function buildPlan({ chapters, studyDays, today = new Date(), keep = [] }) {
  const t = Math.max(0, indexOfDay(dayKey(today)))
  if (t > PHASES.lastDay) return []
  const plan = []
  const add = (i, chapterId, kind) => plan.push({ i, chapterId, kind, minutes: KINDS[kind].minutes })

  // 1. Dates de découverte des chapitres jamais révisés, réparties jusqu'au 27 déc.
  const fresh = chapters.filter((c) => !(studyDays.get(c.id) || []).length)
  // (si l'on est déjà en fin de période, les découvertes restantes se resserrent sur les jours qui restent)
  const end =
    t > PHASES.reviewEnd
      ? Math.min(PHASES.lastDay, t + fresh.length)
      : Math.min(PHASES.reviewEnd, Math.max(PHASES.discoveryEnd, t + Math.ceil(fresh.length * 1.5)))
  const introDay = new Map(
    fresh.map((c, k) => [c.id, fresh.length === 1 ? t : t + Math.round((k * (end - t)) / (fresh.length - 1))]),
  )

  // 2. Découvertes et révisions espacées, chapitre par chapitre.
  for (const ch of chapters) {
    const days = studyDays.get(ch.id) || []
    let anchor
    let step
    if (days.length === 0) {
      anchor = introDay.get(ch.id)
      step = 0
      add(anchor, ch.id, 'decouverte')
    } else {
      anchor = indexOfDay(days[days.length - 1]) // dernière révision réelle
      step = Math.min(days.length - 1, INTERVALS.length - 1)
      // Chapitre en difficulté : on revient à des écarts plus courts.
      if (ch.attempts && ch.rate < 60) step = Math.max(0, step - 2)
    }
    const f = performanceFactor(ch)
    let d = anchor
    for (let s = step; s < INTERVALS.length; s++) {
      d = Math.max(d + Math.max(1, Math.round(INTERVALS[s] * f)), t) // en retard → rattrapage aujourd'hui
      if (d > PHASES.reviewEnd) break
      add(d, ch.id, 'revision')
    }
  }

  // 3. Consolidation finale : 2 chapitres par jour, les plus faibles d'abord,
  //    et une révision globale tous les 4 jours.
  const byWeakness = [...chapters].sort((a, b) => weakness(b) - weakness(a))
  let slot = 0
  for (let d = Math.max(PHASES.consolidationStart, t); d <= PHASES.lastDay; d++) {
    if ((d - PHASES.consolidationStart) % 4 === 3) {
      add(d, null, 'globale')
    } else if (byWeakness.length) {
      add(d, byWeakness[slot++ % byWeakness.length].id, 'consolidation')
      add(d, byWeakness[slot++ % byWeakness.length].id, 'consolidation')
    }
  }

  // 4. Équilibrage : une révision qui ferait dépasser ~30 min est décalée au
  //    jour suivant (sans dépasser la phase de révisions).
  const load = new Map()
  const busy = (i, m) => load.set(i, (load.get(i) || 0) + m)
  for (const k of keep) busy(indexOfDay(k.day), k.minutes)
  plan.sort((a, b) => a.i - b.i || (a.kind === 'revision') - (b.kind === 'revision'))
  for (const p of plan) {
    if (p.kind === 'revision') {
      while (
        p.i < PHASES.reviewEnd &&
        (load.get(p.i) || 0) + p.minutes > DAILY_BUDGET_MIN + TOLERANCE_MIN
      ) {
        p.i++
      }
    }
    busy(p.i, p.minutes)
  }

  // 5. Pas de doublon (même chapitre, même jour), ni avec les sessions conservées.
  const seen = new Set(keep.map((k) => `${k.day}|${k.chapterId}`))
  const out = []
  for (const p of plan.sort((a, b) => a.i - b.i)) {
    const day = dayOfIndex(p.i)
    const key = `${day}|${p.chapterId}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ day, chapterId: p.chapterId, kind: p.kind, minutes: p.minutes })
  }
  return out
}
