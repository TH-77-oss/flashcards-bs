// Analyse détaillée d'un chapitre : indicateurs, évolution session après
// session, et historique complet de ses révisions.
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { useChapterDashboard } from '../hooks/useDashboard.js'
import { formatDuration } from '../lib/dates.js'
import LineChart from '../components/charts/LineChart.jsx'
import ChartCard from '../components/charts/ChartCard.jsx'
import '../styles/dashboard.css'

const fmtDate = (ms) =>
  new Date(ms).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) +
  ' · ' +
  new Date(ms).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

export default function ChapterStats() {
  const id = Number(useParams().id)
  const data = useChapterDashboard(id)
  const [sel, setSel] = useState(null)

  if (!data) return <div className="page" />
  if (!data.chapter) return <Navigate to="/stats" replace />

  const { chapter: ch, history, cardMs, readMs } = data
  const selected = history.find((h) => h.sessionId === sel)

  return (
    <div className="page dashboard">
      <Link to="/stats" className="back-link">
        ‹ Statistiques
      </Link>
      <header className="page-header">
        <h1 className="large-title">{ch.title}</h1>
        <p className="muted small">
          {ch.mastered} / {ch.cards} cartes maîtrisées ({ch.masteryPct} %)
        </p>
      </header>

      <div className="kpi-grid">
        <Kpi value={ch.rate === null ? '—' : `${ch.rate} %`} label="Taux de réussite" />
        <Kpi value={ch.sessions} label="Sessions" />
        <Kpi value={ch.good} label="Bonnes réponses" />
        <Kpi value={ch.attempts - ch.good} label="Mauvaises réponses" />
      </div>

      <section className="card time-split chapter-time">
        <div>
          <span className="time-split-value">{formatDuration(cardMs)}</span>
          <span className="muted tiny">Flashcards</span>
        </div>
        <div>
          <span className="time-split-value">{formatDuration(readMs)}</span>
          <span className="muted tiny">Lecture du cours</span>
        </div>
        <div>
          <span className="time-split-value">{formatDuration(cardMs + readMs)}</span>
          <span className="muted tiny">Total</span>
        </div>
      </section>

      <ChartCard
        title="Évolution par session"
        readout={
          selected
            ? `${fmtDate(selected.at)} · ${selected.rate} % (${selected.good}/${selected.cards})`
            : history.length
              ? 'Touchez la courbe pour lire une session'
              : 'Aucune session pour l’instant'
        }
      >
        <LineChart
          points={history.map((h) => ({ key: h.sessionId, value: h.rate }))}
          selectedKey={sel}
          onSelect={setSel}
          height={120}
          ariaLabel="Taux de réussite du chapitre à chaque session"
        />
      </ChartCard>

      {history.length > 0 && (
        <section className="card history">
          <span className="chart-title">Historique</span>
          <ul className="history-list">
            {[...history].reverse().map((h) => (
              <li key={h.sessionId} className="history-row">
                <span className="small">{fmtDate(h.at)}</span>
                <span className="small muted">{formatDuration(h.studyMs)}</span>
                <span className="small muted">
                  {h.good}/{h.cards}
                </span>
                <span className="small history-rate">{h.rate} %</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link to={`/session/${ch.id}`} className="button-primary">
        Réviser ce chapitre
      </Link>
    </div>
  )
}

function Kpi({ value, label }) {
  return (
    <div className="card stat">
      <span className="stat-value">{value}</span>
      <span className="muted tiny">{label}</span>
    </div>
  )
}
