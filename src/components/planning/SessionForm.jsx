// Formulaire d'ajout / de modification d'une session prévue.
import { useState } from 'react'
import { KINDS } from '../../domain/scheduler.js'

export default function SessionForm({ initial, chapters, onSubmit, onCancel, submitLabel }) {
  const [kind, setKind] = useState(initial.kind || 'revision')
  const [chapterId, setChapterId] = useState(initial.chapterId || 1)
  const [minutes, setMinutes] = useState(initial.minutes || KINDS[initial.kind || 'revision'].minutes)

  function pickKind(k) {
    setKind(k)
    if (!initial.minutes) setMinutes(KINDS[k].minutes)
  }

  return (
    <div className="session-form">
      <div className="segmented four" role="radiogroup" aria-label="Type de session">
        {Object.entries(KINDS).map(([k, v]) => (
          <button
            key={k}
            role="radio"
            aria-checked={kind === k}
            className={'segmented-item' + (kind === k ? ' is-selected' : '')}
            onClick={() => pickKind(k)}
          >
            {v.label.replace('Révision globale', 'Globale').replace('Consolidation', 'Consolid.')}
          </button>
        ))}
      </div>

      {kind !== 'globale' && (
        <div className="chapter-chips" role="radiogroup" aria-label="Chapitre">
          {chapters.map((c) => (
            <button
              key={c.id}
              role="radio"
              aria-checked={chapterId === c.id}
              className={'chapter-chip' + (chapterId === c.id ? ' is-selected' : '')}
              onClick={() => setChapterId(c.id)}
              aria-label={c.title}
            >
              {c.id}
            </button>
          ))}
        </div>
      )}

      <div className="stepper">
        <span className="muted small">Durée prévue</span>
        <span className="stepper-controls">
          <button onClick={() => setMinutes((m) => Math.max(5, m - 5))} aria-label="Moins 5 minutes">
            −
          </button>
          <span className="stepper-value">{minutes} min</span>
          <button onClick={() => setMinutes((m) => Math.min(120, m + 5))} aria-label="Plus 5 minutes">
            +
          </button>
        </span>
      </div>

      <div className="button-row">
        <button className="button-secondary" onClick={onCancel}>
          Annuler
        </button>
        <button className="button-primary" onClick={() => onSubmit({ kind, chapterId, minutes })}>
          {submitLabel}
        </button>
      </div>
    </div>
  )
}
