// Page d'un chapitre. useParams lit le :id de l'adresse /chapitres/:id.
import { Link, useParams, Navigate } from 'react-router'
import { CHAPTERS } from '../data/chapters.js'

export default function ChapterDetail() {
  const { id } = useParams()
  const chapter = CHAPTERS.find((c) => c.id === Number(id))

  if (!chapter) return <Navigate to="/chapitres" replace />

  return (
    <div className="page">
      <Link to="/chapitres" className="back-link">
        ‹ Chapitres
      </Link>
      <header className="page-header">
        <h1 className="large-title">{chapter.title}</h1>
      </header>

      <section className="card">
        <p className="muted">
          Les flashcards de ce chapitre seront ajoutées à partir de vos slides (étape 8).
        </p>
      </section>

      <button className="button-primary" disabled>
        Réviser ce chapitre
      </button>
    </div>
  )
}
