// Grille d'un mois (lundi → dimanche). Sous chaque jour, une pastille par
// type de session prévue. Le jour sélectionné est en bleu, aujourd'hui entouré.
import { dayKey } from '../../lib/dates.js'
import { KIND_COLOR } from './kinds.js'

const FIRST = '2026-11-09'
const EXAM = '2027-02-01'

export default function MonthGrid({ month, selected, today, byDay, onSelect, onPrev, onNext }) {
  const year = 2026 + Math.floor((10 + month) / 12)
  const m = (10 + month) % 12
  const lead = (new Date(year, m, 1).getDay() + 6) % 7 // décalage pour commencer un lundi
  const nDays = new Date(year, m + 1, 0).getDate()
  const label = new Date(year, m, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  const cells = []
  for (let k = 0; k < lead; k++) cells.push(null)
  for (let d = 1; d <= nDays; d++) cells.push(dayKey(new Date(year, m, d)))

  return (
    <section className="card month">
      <div className="month-head">
        <button className="month-nav" onClick={onPrev} disabled={month === 0} aria-label="Mois précédent">
          ‹
        </button>
        <span className="month-label">{label}</span>
        <button className="month-nav" onClick={onNext} disabled={month === 3} aria-label="Mois suivant">
          ›
        </button>
      </div>
      <div className="month-dow muted tiny">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="month-grid">
        {cells.map((key, i) => {
          if (!key) return <span key={`b${i}`} />
          const inRange = key >= FIRST && key <= EXAM
          const list = byDay.get(key) || []
          const kinds = new Set(list.map((p) => (p.kind === 'globale' ? 'consolidation' : p.kind)))
          const allDone = list.length > 0 && list.every((p) => p.status === 'done')
          const cls =
            'day-cell' +
            (key === selected ? ' is-selected' : '') +
            (key === today ? ' is-today' : '') +
            (key === EXAM ? ' is-exam' : '') +
            (allDone ? ' is-done' : '') +
            (!inRange ? ' is-out' : '')
          return (
            <button key={key} className={cls} disabled={!inRange} onClick={() => onSelect(key)}>
              <span className="day-num">{Number(key.slice(8))}</span>
              <span className="day-dots">
                {['decouverte', 'revision', 'consolidation'].map((k) => (
                  <i key={k} style={{ background: kinds.has(k) ? KIND_COLOR[k] : 'transparent' }} />
                ))}
              </span>
            </button>
          )
        })}
      </div>
      <Legend />
    </section>
  )
}

export function Legend() {
  return (
    <div className="plan-legend muted tiny">
      <span><i style={{ background: KIND_COLOR.decouverte }} />Découverte</span>
      <span><i style={{ background: KIND_COLOR.revision }} />Révision</span>
      <span><i style={{ background: KIND_COLOR.consolidation }} />Consolidation</span>
      <span className="ok">✓ journée faite</span>
    </div>
  )
}
