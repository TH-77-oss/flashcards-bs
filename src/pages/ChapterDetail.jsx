// Page d'un chapitre. useParams lit le :id de l'adresse /chapitres/:id.
import { Link, useParams, Navigate } from 'react-router'
import { useStats } from '../hooks/useData.js'

export default function ChapterDetail() {
  const id = Number(useParams().id)
  const stats = useStats()
  if (!stats) return <div className="page" />

  const ch = stats.chapters.find((c) => c.id === id)
  if (!ch) return <Navigate to="/chapitres" replace />

  return (
    <div className="page">
      <Link to="/chapitres" className="back-link">
        ‹ Chapitres
      </Link>
      <header className="page-header">
        <h1 className="large-title">{ch.title}</h1>
        {ch.isMastered && <p className="ok small">✓ Chapitre maîtrisé</p>}
      </header>

      <div className="kpi-grid">
        <Kpi value={ch.rate === null ? '—' : `${ch.rate} %`} label="Réussite" />
        <Kpi value={ch.sessions} label="Sessions" />
        <Kpi value={ch.good} label="Bonnes réponses" />
        <Kpi value={ch.attempts - ch.good} label="Mauvaises réponses" />
      </div>

      <section className="card">
        <div className="today-row">
          <span>Maîtrise</span>
          <span className="today-value">
            {ch.mastered} / {ch.cards} cartes
          </span>
        </div>
        <div className="progress" aria-hidden="true">
          <div className="progress-fill progress-ok" style={{ width: `${ch.masteryPct}%` }} />
        </div>
        <p className="muted tiny maitrise-help">
          Une carte est maîtrisée après 3 bonnes réponses de suite, sur 3 jours différents, étalées sur au moins 7 jours.
        </p>
      </section>

      {ch.cards > 0 ? (
        <Link to={`/session/${ch.id}`} className="button-primary">
          Réviser ce chapitre ({ch.cards} cartes)
        </Link>
      ) : (
        <button className="button-primary" disabled>
          Aucune carte pour l’instant
        </button>
      )}
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
