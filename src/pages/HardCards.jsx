// « Mes cartes difficiles » : les cartes les plus souvent ratées, tous chapitres
// confondus, avec un bouton pour les réviser en une session.
import { Link } from 'react-router'
import { useDifficultCards } from '../hooks/useInsights.js'
import { CATEGORIES } from '../data/sampleCards.js'
import '../styles/insights.css'

export default function HardCards() {
  const list = useDifficultCards(20)
  if (!list) return <div className="page" />

  return (
    <div className="page insights">
      <Link to="/stats" className="back-link">
        ‹ Statistiques
      </Link>
      <header className="page-header">
        <h1 className="large-title">Cartes difficiles</h1>
        <p className="muted small">Cartes déjà ratées et pas encore maîtrisées, de la plus difficile à la moins difficile.</p>
      </header>

      {list.length === 0 ? (
        <p className="card muted small">Aucune carte difficile pour l’instant. Elles apparaîtront ici dès que vous en raterez.</p>
      ) : (
        <>
          <Link to="/session/difficiles" className="button-primary">
            Réviser ces {list.length} cartes
          </Link>
          <ul className="grouped-list">
            {list.map((h) => (
              <li key={h.card.id}>
                <Link to={`/cartes/${h.card.id}`} className="hard-row">
                  <span className="hard-meta muted tiny">
                    Ch. {h.card.chapterId} · {CATEGORIES[h.card.category] || h.card.category}
                    {h.lastWrong && <span className="ko"> · ratée la dernière fois</span>}
                  </span>
                  <span className="hard-question">{h.card.question}</span>
                  <span className="hard-score small">
                    <span className="ko">{h.wrong} erreur{h.wrong > 1 ? 's' : ''}</span>
                    <span className="muted"> · {h.good} juste{h.good > 1 ? 's' : ''} · {h.rate} %</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
