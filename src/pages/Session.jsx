// Session de révision d'un chapitre : une carte à la fois, on la retourne,
// on se note, puis un bilan s'affiche à la fin.
// Chaque réponse est enregistrée immédiatement dans la base locale.
import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router'
import { getCourse, sectionCardIds } from '../lib/courses.js'
import { useDifficultCards } from '../hooks/useInsights.js'
import FlipCard from '../components/FlipCard.jsx'
import NoteSheet from '../components/NoteSheet.jsx'
import { useNotesMap } from '../hooks/useNotes.js'
import { useChapter, useSessionCards } from '../hooks/useData.js'
import { startSession, endSession, recordAnswer } from '../db/repository.js'
import { CATEGORIES } from '../data/sampleCards.js'
import { newId } from '../lib/id.js'
import '../styles/session.css'
import '../styles/notes.css'

// Au-delà de 2 minutes sur une carte, on considère que le téléphone a été
// posé : le temps compté est plafonné.
const MAX_CARD_MS = 2 * 60 * 1000
// Révision globale : un échantillon de 40 cartes tirées dans tous les chapitres.
const GLOBAL_SIZE = 40

// Mélange de Fisher-Yates : ordre aléatoire à chaque session.
function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Session() {
  const param = useParams().chapterId
  const isGlobal = param === 'tout' // adresse /session/tout = révision globale
  const isHard = param === 'difficiles' // adresse /session/difficiles = cartes difficiles
  const chapterId = isGlobal || isHard ? null : Number(param)
  const hard = useDifficultCards(20)
  const found = useChapter(chapterId)
  const cards = useSessionCards(chapterId)
  // /session/3?partie=s2 : uniquement les cartes d'une partie du cours
  const partie = useSearchParams()[0].get('partie')

  if (cards === undefined || hard === undefined || (chapterId !== null && found === undefined)) return <div className="session" /> // chargement
  if (chapterId !== null && !found) return <Navigate to="/chapitres" replace />

  if (isHard) {
    const ids = new Set(hard.map((h) => h.card.id))
    return (
      <SessionRun
        key="difficiles"
        chapter={{ id: null, title: 'Cartes difficiles', mode: 'difficiles' }}
        initialCards={cards.filter((c) => ids.has(c.id))}
      />
    )
  }

  const ids = !isGlobal && partie ? sectionCardIds(chapterId, partie) : null
  const section = ids ? getCourse(chapterId).sections.find((s) => s.id === partie) : null
  const chapter = isGlobal
    ? { id: null, title: 'Révision globale' }
    : section
      ? { ...found, title: `${found.title} · partie ${getCourse(chapterId).sections.indexOf(section) + 1}` }
      : found
  const initialCards = isGlobal ? shuffle(cards).slice(0, GLOBAL_SIZE) : ids ? cards.filter((c) => ids.has(c.id)) : cards

  // key : si on change de chapitre ou de partie, la session repart de zéro.
  return <SessionRun key={`${chapter.id ?? 'tout'}-${partie || ''}`} chapter={chapter} initialCards={initialCards} />
}

function SessionRun({ chapter, initialCards }) {
  const navigate = useNavigate()
  const [cards, setCards] = useState(() =>
    shuffle(initialCards).map((c) => ({ ...c, categoryLabel: CATEGORIES[c.category] || c.category })),
  )
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  // Réponses de CETTE session (pour le bilan) : { idDeCarte: { correct, durationMs } }
  const [answers, setAnswers] = useState({})
  const shownAt = useRef(0) // instant où la carte actuelle est apparue
  const notes = useNotesMap()
  const [showHint, setShowHint] = useState(false)
  const [editingNote, setEditingNote] = useState(false)
  const noteOpenedAt = useRef(0)
  const sessionId = useRef(null) // la session n'est créée qu'à la première réponse

  useEffect(() => {
    shownAt.current = Date.now()
  }, [])

  const done = index >= cards.length
  const card = cards[index]

  // Fin de session : on enregistre l'heure de fin.
  useEffect(() => {
    if (done && sessionId.current) endSession(sessionId.current)
  }, [done])

  function goTo(i) {
    setIndex(i)
    setFlipped(false)
    setShowHint(false)
    shownAt.current = Date.now()
  }

  function ensureSession() {
    if (!sessionId.current) {
      sessionId.current = newId()
      startSession(sessionId.current, chapter.id, chapter.mode || null)
    }
    return sessionId.current
  }

  function grade(correct) {
    const durationMs = Math.min(Date.now() - shownAt.current, MAX_CARD_MS)
    recordAnswer({ sessionId: ensureSession(), card, correct, durationMs }).catch((err) =>
      console.error('Réponse non enregistrée', err),
    )
    setAnswers((prev) => ({ ...prev, [card.id]: { correct, durationMs } }))
    goTo(index + 1)
  }

  function restart(onlyMistakes) {
    const next = onlyMistakes ? cards.filter((c) => answers[c.id] && !answers[c.id].correct) : cards
    sessionId.current = null // une nouvelle session commencera à la prochaine réponse
    setCards(shuffle(next))
    setAnswers({})
    goTo(0)
  }

  // Le temps passé à écrire une note n'est pas compté dans le temps de réponse.
  function openNote() {
    noteOpenedAt.current = Date.now()
    setEditingNote(true)
  }
  function closeNote() {
    shownAt.current += Date.now() - noteOpenedAt.current
    setEditingNote(false)
  }

  function quit() {
    if (sessionId.current && !done) endSession(sessionId.current)
    navigate(chapter.id ? `/chapitres/${chapter.id}` : chapter.mode === 'difficiles' ? '/stats/difficiles' : '/planning')
  }

  if (cards.length === 0) {
    return (
      <div className="session session-empty">
        <p className="muted">Ce chapitre ne contient pas encore de cartes.</p>
        <button className="button-secondary" onClick={quit}>
          Retour
        </button>
      </div>
    )
  }

  if (done) {
    const results = Object.values(answers)
    const good = results.filter((r) => r.correct).length
    const bad = results.length - good
    const rate = results.length ? Math.round((100 * good) / results.length) : 0
    const minutes = Math.max(1, Math.round(results.reduce((t, r) => t + r.durationMs, 0) / 60000))

    return (
      <div className="session session-summary">
        <p className="muted">{chapter.title} · session terminée</p>
        <p className="summary-rate">{rate} %</p>
        <p className="summary-detail">
          <span className="ok">{good} justes</span> · <span className="ko">{bad} à revoir</span>
        </p>
        <p className="muted small">≈ {minutes} min de révision · session enregistrée</p>

        <div className="summary-actions">
          {bad > 0 && (
            <button className="button-primary" onClick={() => restart(true)}>
              Revoir les {bad} erreurs
            </button>
          )}
          <button className={bad > 0 ? 'button-secondary' : 'button-primary'} onClick={() => restart(false)}>
            Recommencer tout le chapitre
          </button>
          <button className="button-secondary" onClick={quit}>
            Terminer
          </button>
        </div>
      </div>
    )
  }

  const progress = `${Math.round((100 * index) / cards.length)}%`
  const note = notes?.get(card.id) || null

  return (
    <div className="session">
      <header className="session-top">
        <button className="icon-button" onClick={quit} aria-label="Quitter la session">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <span className="session-title">{chapter.title}</span>
        <span className="session-pos">
          {index + 1} / {cards.length}
        </span>
      </header>

      <div className="progress" aria-hidden="true">
        <div className="progress-fill" style={{ width: progress }} />
      </div>

      <div className="session-tools">
        {note && !flipped ? (
          <button className="tool-button" onClick={() => setShowHint((h) => !h)} aria-pressed={showHint}>
            {showHint ? 'Masquer l’indice' : 'Indice'}
          </button>
        ) : (
          <span />
        )}
        <button className="tool-button" onClick={openNote}>
          {note ? 'Modifier ma note' : '+ Ma note'}
        </button>
      </div>

      <FlipCard card={card} flipped={flipped} onFlip={() => setFlipped((f) => !f)} note={note} showHint={showHint} />

      {editingNote && <NoteSheet card={card} initialText={note || ''} onClose={closeNote} />}

      {flipped ? (
        <div className="session-actions">
          <button className="button-ko" onClick={() => grade(false)}>
            À revoir
          </button>
          <button className="button-ok" onClick={() => grade(true)}>
            Je savais
          </button>
        </div>
      ) : (
        <div className="session-actions">
          <button className="button-secondary" onClick={() => goTo(index - 1)} disabled={index === 0}>
            Précédente
          </button>
          <button className="button-secondary" onClick={() => goTo(index + 1)} disabled={index === cards.length - 1}>
            Suivante
          </button>
        </div>
      )}
    </div>
  )
}
