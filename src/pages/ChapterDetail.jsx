// Page d'un chapitre : statistiques, maîtrise, et liste des cartes
// (toucher une carte pour la modifier, « + Ajouter » pour en créer une).
import { Link, useParams, Navigate } from 'react-router'
import { useStats, useChapterCards } from '../hooks/useData.js'
import { useNotesMap } from '../hooks/useNotes.js'
import { CATEGORIES } from '../data/sampleCards.js'
import '../styles/editor.css'
import '../styles/notes.css'

export default function ChapterDetail() {
  const id = Number(useParams().id)
  const stats = useStats()
  const cards = useChapterCards(id)
  const notes = useNotesMap()
  if (!stats || !cards || !notes) return <div className="page" />
  const noteCount = cards.filter((c) => notes.has(c.id)).length

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

      {ch.cards > 0 ? (
        <Link to={`/session/${ch.id}`} className="button-primary">
          Réviser ce chapitre ({ch.cards} cartes)
        </Link>
      ) : (
        <button className="button-primary" disabled>
          Aucune carte pour l’instant
        </button>
      )}

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

      <div className="section-head">
        <h2 className="section-title">Cartes ({cards.length})</h2>
        <span className="section-actions">
          {noteCount > 0 && (
            <Link to={`/notes#chapitre-${ch.id}`} className="text-link">
              Notes ({noteCount})
            </Link>
          )}
          <Link to={`/cartes/nouvelle/${ch.id}`} className="text-link">
            + Ajouter
          </Link>
        </span>
      </div>

      {cards.length > 0 && (
        <ul className="grouped-list">
          {cards.map((card) => (
            <li key={card.id}>
              <Link to={`/cartes/${card.id}`} className="list-row card-row">
                <span className="list-row-text">
                  <span className="card-row-meta">
                    <span className="mini-chip">{CATEGORIES[card.category] || card.category}</span>
                    {(card.imageId || card.image) && <span className="muted tiny">· image</span>}
                    {notes.has(card.id) && <span className="note-flag tiny">· note</span>}
                  </span>
                  <span className="card-row-question">{card.question}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
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
