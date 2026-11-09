// Frise des 12 semaines : une ligne par chapitre, une colonne par semaine.
// La couleur indique le type de session prévu cette semaine-là (découverte
// prioritaire, puis révision, puis consolidation). Toucher une case ouvre
// le mois correspondant sur le lundi de cette semaine.
import { KIND_COLOR } from './kinds.js'
import { Legend } from './MonthGrid.jsx'
import { indexOfDay, dayOfIndex } from '../../domain/scheduler.js'

const WEEKS = 12

export default function Frise({ planned, today, onPickDay }) {
  const todayWeek = Math.floor(indexOfDay(today) / 7)
  const cell = new Map() // "chapitre|semaine" → { kind, count }
  const globalWeeks = new Set()
  for (const p of planned) {
    const w = Math.floor(indexOfDay(p.day) / 7)
    if (w < 0 || w >= WEEKS) continue
    if (p.chapterId === null) {
      globalWeeks.add(w)
      continue
    }
    const key = `${p.chapterId}|${w}`
    const prev = cell.get(key) || { rank: 9, count: 0 }
    const rank = { decouverte: 0, revision: 1, consolidation: 2 }[p.kind] ?? 2
    cell.set(key, { rank: Math.min(prev.rank, rank), count: prev.count + 1 })
  }
  const RANK_KIND = ['decouverte', 'revision', 'consolidation']

  return (
    <section className="card frise">
      <div className="phases">
        <span style={{ flex: 49, background: 'var(--chart-blue)' }} />
        <span style={{ flex: 21, background: 'var(--chart-violet)' }} />
        <span style={{ flex: 14, background: 'var(--chart-amber)' }} />
      </div>
      <div className="phases-labels muted tiny">
        <span style={{ flex: 49 }}>Découverte · → 27 déc.</span>
        <span style={{ flex: 21 }}>Révisions</span>
        <span style={{ flex: 14 }}>Consolid.</span>
      </div>

      <div className="frise-row frise-header muted">
        <span>Ch.</span>
        {Array.from({ length: WEEKS }, (_, w) => (
          <span key={w} className={w === todayWeek ? 'frise-now' : ''}>
            S{w + 1}
          </span>
        ))}
      </div>
      {Array.from({ length: 18 }, (_, i) => i + 1).map((ch) => (
        <div key={ch} className="frise-row">
          <span className="muted">{ch}</span>
          {Array.from({ length: WEEKS }, (_, w) => {
            const c = cell.get(`${ch}|${w}`)
            const bg = c ? KIND_COLOR[RANK_KIND[c.rank]] : globalWeeks.has(w) ? '#4a3418' : 'var(--surface-2)'
            return (
              <button
                key={w}
                className={'frise-cell' + (w === todayWeek ? ' is-now' : '')}
                style={{ background: bg }}
                onClick={() => onPickDay(dayOfIndex(w * 7))}
                aria-label={`Chapitre ${ch}, semaine ${w + 1}`}
              >
                {c && c.count > 1 ? c.count : ''}
              </button>
            )
          })}
        </div>
      ))}
      <Legend />
      <p className="muted tiny">Case ambre foncé : semaine avec une révision globale de tous les chapitres. Touchez une case pour ouvrir la semaine.</p>
    </section>
  )
}
