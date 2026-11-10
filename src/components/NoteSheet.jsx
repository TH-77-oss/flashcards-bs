// Fenêtre d'édition d'une note, affichée par-dessus l'écran.
// Placée en haut de l'écran pour ne pas être cachée par le clavier de l'iPhone.
import { useState } from 'react'
import { saveNote } from '../db/repository.js'
import '../styles/notes.css'

export default function NoteSheet({ card, initialText = '', onClose }) {
  const [text, setText] = useState(initialText)
  const [busy, setBusy] = useState(false)
  const exists = initialText.trim().length > 0

  async function save(value) {
    setBusy(true)
    await saveNote(card.id, value)
    onClose()
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="note-sheet" role="dialog" aria-modal="true" aria-label="Ma note" onClick={(e) => e.stopPropagation()}>
        <div className="note-sheet-bar">
          <button className="text-link-button" onClick={onClose}>
            Annuler
          </button>
          <span className="note-sheet-title">Ma note</span>
          <button className="text-link-button strong" onClick={() => save(text)} disabled={busy}>
            Enregistrer
          </button>
        </div>
        <p className="muted small note-sheet-question">{card.question}</p>
        <textarea
          className="note-textarea"
          rows={7}
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Votre propre formulation, un moyen mnémotechnique, un exemple…"
        />
        {exists && (
          <button className="note-delete" onClick={() => save('')} disabled={busy}>
            Supprimer la note
          </button>
        )}
      </div>
    </div>
  )
}
