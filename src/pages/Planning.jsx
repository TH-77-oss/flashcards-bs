// Onglet Planning : vue Mois (par défaut) ou Frise des 12 semaines,
// détail du jour choisi, et génération automatique du planning.
import { useEffect, useState } from 'react'
import { usePlanning } from '../hooks/usePlanning.js'
import { ensurePlan, regeneratePlan } from '../db/planning.js'
import { daysUntilExam, EXAM_DATE_LABEL, dayKey, parseDayKey } from '../lib/dates.js'
import MonthGrid from '../components/planning/MonthGrid.jsx'
import Frise from '../components/planning/Frise.jsx'
import DaySheet from '../components/planning/DaySheet.jsx'
import '../styles/dashboard.css'
import '../styles/planning.css'

const FIRST = '2026-11-09'
const EXAM = '2027-02-01'
const clampDay = (k) => (k < FIRST ? FIRST : k > EXAM ? EXAM : k)
const monthOf = (k) => {
  const d = parseDayKey(k)
  return (d.getFullYear() - 2026) * 12 + d.getMonth() - 10
}

export default function Planning() {
  const plan = usePlanning()
  const today = dayKey()
  const [view, setView] = useState('mois')
  const [selected, setSelected] = useState(() => clampDay(today))
  const [month, setMonth] = useState(() => monthOf(clampDay(today)))
  const [message, setMessage] = useState('')

  // Premier passage : on génère le planning s'il n'existe pas encore.
  useEffect(() => {
    ensurePlan().catch((err) => console.error('Planning non généré', err))
  }, [])

  if (!plan) return <div className="page" />

  const done = plan.planned.filter((p) => p.status === 'done').length

  function pickDay(k) {
    setSelected(k)
    setMonth(monthOf(k))
    setView('mois')
  }

  async function onRegenerate() {
    const ok = window.confirm(
      'Recalculer le planning à partir d’aujourd’hui selon vos performances ?\nLes sessions réalisées et celles que vous avez modifiées sont conservées.',
    )
    if (!ok) return
    await regeneratePlan()
    setMessage('Planning recalculé selon vos derniers résultats.')
  }

  return (
    <div className="page planning">
      <header className="planning-head">
        <div className="page-header">
          <p className="muted small">Examen · {EXAM_DATE_LABEL}</p>
          <h1 className="large-title">Planning</h1>
        </div>
        <span className="countdown-value">J-{daysUntilExam()}</span>
      </header>

      <div className="segmented two" role="radiogroup" aria-label="Vue">
        {[
          ['mois', 'Mois'],
          ['frise', 'Frise 12 semaines'],
        ].map(([k, label]) => (
          <button
            key={k}
            role="radio"
            aria-checked={view === k}
            className={'segmented-item' + (view === k ? ' is-selected' : '')}
            onClick={() => setView(k)}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'mois' ? (
        <>
          <MonthGrid
            month={month}
            selected={selected}
            today={today}
            byDay={plan.byDay}
            onSelect={setSelected}
            onPrev={() => setMonth((m) => Math.max(0, m - 1))}
            onNext={() => setMonth((m) => Math.min(3, m + 1))}
          />
          <DaySheet
            key={selected}
            day={selected}
            sessions={plan.byDay.get(selected) || []}
            chapters={plan.chapters}
            titles={plan.titles}
            today={today}
          />
        </>
      ) : (
        <Frise planned={plan.planned} today={today} onPickDay={pickDay} />
      )}

      <div className="plan-footer">
        <p className="muted small">
          {plan.planned.length} sessions prévues · <span className="ok">{done} réalisées</span>
        </p>
        <div className="button-row">
          <button className="button-secondary" onClick={() => pickDay(clampDay(today))}>
            Aujourd’hui
          </button>
          <button className="button-secondary accent" onClick={onRegenerate}>
            Recalculer
          </button>
        </div>
        {message && <p className="muted small">{message}</p>}
        <p className="muted tiny">
          Le planning s’adapte : un chapitre sous 60 % de réussite revient plus vite, un chapitre bien maîtrisé
          s’espace. Lancer une session depuis l’app la marque réalisée automatiquement.
        </p>
      </div>
    </div>
  )
}
