import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { daysUntilExam, EXAM_DATE_LABEL, formatDuration, dayKey } from '../lib/dates.js'
import { useStats } from '../hooks/useData.js'
import { exportBackup, importBackup } from '../db/backup.js'
import { usePlanning } from '../hooks/usePlanning.js'
import { KINDS } from '../domain/scheduler.js'
import { sessionTitle } from '../components/planning/kinds.js'

export default function Home() {
  const stats = useStats()
  const days = daysUntilExam()

  if (!stats) return <div className="page" />

  const rate = stats.rate === null ? '—' : `${stats.rate} %`

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
          <p className="muted small">{stats.chaptersWorked} / 18 chapitres</p>
        </div>
        <Link to={`/chapitres/${stats.nextChapter.id}`} className="button-primary">
          Réviser le {stats.nextChapter.title.toLowerCase()}
        </Link>
      </section>

      <TodayPlan />

      <div className="stat-grid">
        <Stat value={stats.total} label="Cartes révisées" />
        <Stat value={rate} label="Réussite" />
        <Stat value={stats.sessions} label="Sessions" />
      </div>

      <section className="card today">
        <p className="section-label">Aujourd’hui</p>
        <div className="today-row">
          <span>Révision</span>
          <span className="today-value">{formatDuration(stats.studyMsToday)}</span>
        </div>
        <div className="progress" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${Math.min(100, (stats.studyMsToday / (30 * 60000)) * 100)}%` }} />
        </div>
        <div className="today-row muted small">
          <span>Objectif 30 min</span>
          <span>Temps dans l’app : {formatDuration(stats.appMsToday)}</span>
        </div>
      </section>

      <BackupCard />
    </div>
  )
}

// Les sessions prévues aujourd'hui dans le planning, avec un bouton pour lancer.
function TodayPlan() {
  const plan = usePlanning()
  if (!plan) return null
  const list = plan.byDay.get(dayKey()) || []
  if (list.length === 0) return null
  const next = list.find((p) => p.status !== 'done')

  return (
    <section className="card today">
      <p className="section-label">Au programme aujourd’hui</p>
      {list.map((p) => (
        <div key={p.id} className="today-row">
          <span className={p.status === 'done' ? 'muted' : ''}>
            {p.status === 'done' ? '✓ ' : ''}
            {sessionTitle(p, plan.titles)}
          </span>
          <span className="muted small">
            {KINDS[p.kind].label} · {p.minutes} min
          </span>
        </div>
      ))}
      {next ? (
        <Link to={`/session/${next.chapterId ?? 'tout'}`} className="button-primary">
          Lancer : {sessionTitle(next, plan.titles)}
        </Link>
      ) : (
        <p className="ok small">Programme du jour terminé.</p>
      )}
    </section>
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

function BackupCard() {
  const fileInput = useRef(null)
  const [message, setMessage] = useState('')

  async function onExport() {
    try {
      await exportBackup()
      setMessage('Sauvegarde créée.')
    } catch (err) {
      setMessage(`Échec de la sauvegarde : ${err.message}`)
    }
  }

  async function onImport(event) {
    const file = event.target.files[0]
    event.target.value = '' // permet de réimporter le même fichier
    if (!file) return
    if (!window.confirm('Restaurer cette sauvegarde ? Toutes les données actuelles seront remplacées.')) return
    try {
      await importBackup(file)
      setMessage('Sauvegarde restaurée.')
    } catch (err) {
      setMessage(`Échec de la restauration : ${err.message}`)
    }
  }

  return (
    <section className="card backup">
      <p className="section-label">Sauvegarde</p>
      <p className="muted small">
        Vos données sont stockées uniquement sur cet appareil. Exportez-les régulièrement vers Fichiers / iCloud Drive.
      </p>
      <div className="button-row">
        <button className="button-secondary" onClick={onExport}>
          Exporter
        </button>
        <button className="button-secondary" onClick={() => fileInput.current.click()}>
          Restaurer
        </button>
      </div>
      <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={onImport} />
      {message && <p className="small muted">{message}</p>}
    </section>
  )
}
