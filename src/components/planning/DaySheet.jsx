// Détail d'une journée : sessions prévues, charge par rapport à l'objectif
// de 30 min, et toutes les actions (lancer, terminer, modifier, reporter,
// supprimer, ajouter).
import { useState } from 'react'
import { Link } from 'react-router'
import { parseDayKey } from '../../lib/dates.js'
import { KINDS, DAILY_BUDGET_MIN } from '../../domain/scheduler.js'
import { addPlannedSession, updatePlannedSession, deletePlannedSession, toggleDone, postpone } from '../../db/planning.js'
import SessionForm from './SessionForm.jsx'
import { getCourse } from '../../lib/courses.js'
import { KIND_COLOR, sessionTitle } from './kinds.js'

export default function DaySheet({ day, sessions, chapters, titles, today }) {
  const [editing, setEditing] = useState(null) // id de la session modifiée, ou 'new'
  const minutes = sessions.reduce((t, p) => t + p.minutes, 0)
  const label = parseDayKey(day).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const isExam = day === '2027-02-01'

  return (
    <section className="card day-sheet">
      <div className="day-sheet-head">
        <div className="today-row">
          <span className="day-title">{label}</span>
          <span className="muted small">
            {minutes} / {DAILY_BUDGET_MIN} min
          </span>
        </div>
        <div className="progress" aria-hidden="true">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(100, (minutes / DAILY_BUDGET_MIN) * 100)}%`, background: minutes > 40 ? 'var(--chart-amber)' : undefined }}
          />
        </div>
      </div>

      {isExam && <p className="exam-note">Jour de l’examen. Bonne chance !</p>}
      {!isExam && sessions.length === 0 && <p className="muted small sheet-empty">Aucune session prévue : révision libre.</p>}

      <ul className="plan-list">
        {sessions.map((p) =>
          editing === p.id ? (
            <li key={p.id} className="plan-edit">
              <SessionForm
                initial={p}
                chapters={chapters}
                submitLabel="Enregistrer"
                onCancel={() => setEditing(null)}
                onSubmit={async (v) => {
                  await updatePlannedSession(p.id, v)
                  setEditing(null)
                }}
              />
            </li>
          ) : (
            <PlanItem key={p.id} p={p} titles={titles} today={today} onEdit={() => setEditing(p.id)} />
          ),
        )}
      </ul>

      {!isExam &&
        (editing === 'new' ? (
          <div className="plan-edit">
            <SessionForm
              initial={{ kind: 'revision' }}
              chapters={chapters}
              submitLabel="Ajouter"
              onCancel={() => setEditing(null)}
              onSubmit={async (v) => {
                await addPlannedSession({ day, ...v })
                setEditing(null)
              }}
            />
          </div>
        ) : (
          <button className="add-session" onClick={() => setEditing('new')}>
            + Ajouter une session
          </button>
        ))}
    </section>
  )
}

function PlanItem({ p, titles, today, onEdit }) {
  const done = p.status === 'done'
  const missed = !done && p.day < today
  const status = done ? 'Réalisée' : missed ? 'Manquée' : 'Prévue'
  const canLaunch = !done && p.day === today
  // Une découverte commence par la lecture du cours, s'il existe pour ce chapitre.
  const launchTo = p.kind === 'decouverte' && p.chapterId && getCourse(p.chapterId) ? `/cours/${p.chapterId}` : `/session/${p.chapterId ?? 'tout'}`

  return (
    <li className="plan-item">
      <button className="check" onClick={() => toggleDone(p)} aria-label={done ? 'Marquer comme prévue' : 'Marquer comme réalisée'}>
        {done ? (
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="11" fill="var(--ok)" />
            <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#00210a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10.5" fill="none" stroke="var(--text-3)" strokeWidth="1.6" />
          </svg>
        )}
      </button>
      <span className="plan-text">
        <span className={done ? 'muted' : ''}>{sessionTitle(p, titles)}</span>
        <span className="plan-meta muted tiny">
          <i style={{ background: KIND_COLOR[p.kind] }} />
          {KINDS[p.kind].label} · {p.minutes} min ·{' '}
          <span className={done ? 'ok' : missed ? 'ko' : ''}>{status}</span>
        </span>
      </span>
      {canLaunch && (
        <Link to={launchTo} className="launch">
          Lancer
        </Link>
      )}
      <span className="plan-actions">
        <button onClick={onEdit} aria-label="Modifier la session">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />
          </svg>
        </button>
        <button onClick={() => postpone(p)} aria-label="Reporter au lendemain">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
        <button onClick={() => deletePlannedSession(p.id)} aria-label="Supprimer la session">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
          </svg>
        </button>
      </span>
    </li>
  )
}
