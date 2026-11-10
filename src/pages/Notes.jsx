// « Mes notes » : toutes vos notes personnelles, classées par chapitre,
// avec une recherche. Toucher une note permet de la modifier.
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useNotesByChapter } from '../hooks/useNotes.js'
import { CATEGORIES } from '../data/sampleCards.js'
import NoteSheet from '../components/NoteSheet.jsx'
import '../styles/notes.css'

const fmt = (ms) => new Date(ms).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

export default function Notes() {
  const data = useNotesByChapter()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null) // { card, text }
  const { hash } = useLocation()

  // Lien depuis une page chapitre (/notes#chapitre-3) : on défile jusqu'au chapitre.
  useEffect(() => {
    if (data && hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' })
  }, [data, hash])

  if (!data) return <div className="page" />

  const q = query.trim().toLowerCase()
  const groups = data.groups
    .map((g) => ({
      ...g,
      items: q
        ? g.items.filter(({ note, card }) => note.text.toLowerCase().includes(q) || card.question.toLowerCase().includes(q))
        : g.items,
    }))
    .filter((g) => g.items.length)

  return (
    <div className="page notes-page">
      <Link to="/chapitres" className="back-link">
        ‹ Chapitres
      </Link>
      <header className="page-header">
        <h1 className="large-title">Mes notes</h1>
        <p className="muted small">
          {data.total} note{data.total > 1 ? 's' : ''} · classées par chapitre
        </p>
      </header>

      {data.total === 0 ? (
        <p className="card muted small">
          Aucune note pour l’instant. Pendant une révision, touchez « + Ma note » pour écrire votre propre formulation d’une carte.
        </p>
      ) : (
        <>
          <input
            className="notes-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans mes notes"
            aria-label="Rechercher dans mes notes"
          />
          {groups.length === 0 && <p className="muted small">Aucune note ne correspond à « {query} ».</p>}
          {groups.map(({ chapter, items }) => (
            <section key={chapter.id} id={`chapitre-${chapter.id}`} className="notes-group">
              <h2 className="notes-chapter">
                <span className="badge">{chapter.id}</span>
                {chapter.title}
                <span className="muted small">({items.length})</span>
              </h2>
              <ul className="grouped-list">
                {items.map(({ note, card }) => (
                  <li key={card.id}>
                    <button className="note-row" onClick={() => setEditing({ card, text: note.text })}>
                      <span className="note-row-meta muted tiny">
                        {CATEGORIES[card.category] || card.category} · modifiée le {fmt(note.updatedAt)}
                      </span>
                      <span className="note-row-question muted small">{card.question}</span>
                      <span className="note-row-text">{note.text}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}

      {editing && <NoteSheet card={editing.card} initialText={editing.text} onClose={() => setEditing(null)} />}
    </div>
  )
}
