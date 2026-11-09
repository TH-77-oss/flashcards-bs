// Page d'un chapitre. useParams lit le :id de l'adresse /chapitres/:id.
import { Link, useParams, Navigate } from 'react-router'
import { CHAPTERS } from '../data/chapters.js'
import { getCardsForChapter } from '../data/sampleCards.js'

export default function ChapterDetail() {
  const { id } = useParams()
  const chapter = CHAPTERS.find((c) => c.id === Number(id))

  if (!chapter) return <Navigate to="/chapitres" replace />

  const count = getCardsForChapter(chapter.id).length

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
          {count} cartes d’exemple pour tester. Les vraies flashcards de ce chapitre seront générées
          à partir de vos slides (étape 8).
        </p>
      </section>

      <Link to={`/session/${chapter.id}`} className="button-primary">
        Réviser ce chapitre
      </Link>
    </div>
  )
}
