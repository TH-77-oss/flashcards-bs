// Sections ajoutées au dashboard : objectifs et planning, progression de la
// maîtrise avec projection, couverture du cours, cartes difficiles.
import { useState } from 'react'
import { Link } from 'react-router'
import { useInsights } from '../../hooks/useInsights.js'
import { parseDayKey } from '../../lib/dates.js'
import ChartCard from './ChartCard.jsx'
import LineChart from './LineChart.jsx'
import '../../styles/insights.css'

const fmtDay = (key) => parseDayKey(key).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

export default function InsightsSections() {
  const data = useInsights()
  const [selDay, setSelDay] = useState(null)
  if (!data) return null
  const { hard, mastery: m, plan, goal, coverage } = data
  const sel = m.points.find((p) => p.day === selDay)
  const totalPct = m.total ? Math.round((100 * m.current) / m.total) : 0

  let projection
  if (m.total === 0) projection = 'Pas encore de cartes de cours dans l’app.'
  else if (m.pace === null || (m.current === 0 && m.pace === 0))
    projection = 'Projection disponible après une semaine de révisions (une carte demande au moins 7 jours pour être maîtrisée).'
  else
    projection = `Au rythme des 7 derniers jours (${m.pace.toFixed(1)} carte/jour), vous auriez ~${m.projected} / ${m.total} cartes maîtrisées au 1er février (${Math.round((100 * m.projected) / m.total)} %).`

  return (
    <>
      <h2 className="section-title">Objectifs et planning</h2>
      <div className="kpi-grid">
        <Kpi
          value={plan.rate === null ? '—' : `${plan.rate} %`}
          label={`Sessions prévues faites (${plan.pastDone}/${plan.pastTotal})`}
        />
        <Kpi value={plan.missed} label="Sessions manquées" tone={plan.missed ? 'ko' : ''} />
        <Kpi value={`${goal.reachedDays}/${goal.elapsedDays}`} label="Jours avec 30 min atteintes" />
        <Kpi value={`${goal.current} j`} label={`Série « 30 min » · record ${goal.best} j`} />
      </div>
      <p className="muted tiny">
        Depuis le 9 novembre (jours passés uniquement). Aujourd’hui : {plan.todayDone}/{plan.todayTotal} session
        {plan.todayTotal > 1 ? 's' : ''} prévue{plan.todayTotal > 1 ? 's' : ''} faite{plan.todayDone > 1 ? 's' : ''}.
      </p>

      <h2 className="section-title">Maîtrise</h2>
      <ChartCard
        title="Cartes maîtrisées"
        aside={`${m.current} / ${m.total} · ${totalPct} %`}
        readout={sel ? `${fmtDay(sel.day)} · ${sel.mastered} cartes maîtrisées (${Math.round(sel.pct)} %)` : 'Touchez la courbe pour lire une date'}
      >
        <LineChart
          points={m.points.map((p) => ({ key: p.day, value: p.pct }))}
          selectedKey={selDay}
          onSelect={setSelDay}
          color="var(--ok)"
          ariaLabel="Pourcentage de cartes maîtrisées au fil des jours"
        />
        <div className="projection">
          <p className="small">{projection}</p>
          {m.total > m.current && (
            <p className="muted small">
              Pour tout maîtriser à temps : environ <strong>{Math.ceil(m.required)} cartes/jour</strong> à faire passer en
              « maîtrisée » d’ici le 25 janvier ({m.daysLeft} jours avant l’examen).
            </p>
          )}
          <p className="muted tiny">Calculé sur les cartes actuellement dans l’app : le total augmentera avec les prochains chapitres.</p>
        </div>
      </ChartCard>

      <h2 className="section-title">Couverture du cours</h2>
      <section className="card coverage">
        <div className="coverage-head muted tiny">
          <span>Chapitre</span>
          <span>Cours</span>
          <span>Cartes vues</span>
        </div>
        {coverage.map((c) => (
          <Link key={c.id} to={`/chapitres/${c.id}`} className="coverage-row">
            <span className="coverage-title small">
              <span className="muted">{c.id}.</span> {c.cards ? c.title : <span className="muted">{c.title}</span>}
            </span>
            <span className={'small ' + (c.read ? 'ok' : 'muted')}>{!c.hasCourse ? '—' : c.read ? '✓ lu' : 'à lire'}</span>
            <span className="coverage-seen">
              {c.cards ? (
                <>
                  <span className="mini-bar" aria-hidden="true">
                    <span className="mini-bar-fill blue" style={{ width: `${c.seenPct}%` }} />
                  </span>
                  <span className="tiny">
                    {c.seen}/{c.cards}
                  </span>
                </>
              ) : (
                <span className="muted tiny">à venir</span>
              )}
            </span>
          </Link>
        ))}
      </section>

      <h2 className="section-title">Cartes difficiles</h2>
      <section className="card hard-preview">
        {hard.length === 0 ? (
          <p className="muted small">Aucune carte difficile pour l’instant.</p>
        ) : (
          <>
            <ul className="hard-mini">
              {hard.slice(0, 5).map((h) => (
                <li key={h.card.id}>
                  <span className="hard-mini-q small">{h.card.question}</span>
                  <span className="ko tiny">
                    {h.wrong} err. · {h.rate} %
                  </span>
                </li>
              ))}
            </ul>
            <div className="button-row">
              <Link to="/stats/difficiles" className="button-secondary as-link">
                Voir les {hard.length}
              </Link>
              <Link to="/session/difficiles" className="button-primary">
                Réviser
              </Link>
            </div>
          </>
        )}
      </section>
    </>
  )
}

function Kpi({ value, label, tone }) {
  return (
    <div className="card stat">
      <span className={'stat-value ' + (tone || '')}>{value}</span>
      <span className="muted tiny">{label}</span>
    </div>
  )
}
