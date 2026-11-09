import { Link } from 'react-router'
import { daysUntilExam, EXAM_DATE_LABEL } from '../lib/dates.js'

export default function Home() {
  const days = daysUntilExam()

  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow">Business Strategy</p>
        <h1 className="large-title">Révisions</h1>
      </header>

      <section className="card countdown">
        <div className="countdown-row">
          <div>
            <p className="muted small">Examen · {EXAM_DATE_LABEL}</p>
            <p className="countdown-value">J-{days}</p>
          </div>
          <p className="muted small">0 / 18 chapitres</p>
        </div>
        <Link to="/chapitres" className="button-primary">
          Choisir un chapitre
        </Link>
      </section>

      {/* Valeurs à zéro pour l'instant : elles seront calculées à l'étape 5 */}
      <div className="stat-grid">
        <Stat value="0" label="Cartes révisées" />
        <Stat value="—" label="Réussite" />
        <Stat value="0" label="Sessions" />
      </div>
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div className="card stat">
      <span className="stat-value">{value}</span>
      <span className="muted tiny">{label}</span>
    </div>
  )
}
