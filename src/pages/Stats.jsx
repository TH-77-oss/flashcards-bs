// Dashboard (design 1 · défilement continu) : indicateurs, évolution dans le
// temps, régularité, puis comparaison des chapitres. Tout est calculé à partir
// de vos réponses réelles, sur la période choisie.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useDashboard } from '../hooks/useDashboard.js'
import { formatDuration, parseDayKey } from '../lib/dates.js'
import PeriodControl from '../components/charts/PeriodControl.jsx'
import LineChart from '../components/charts/LineChart.jsx'
import BarChart from '../components/charts/BarChart.jsx'
import Heatmap from '../components/charts/Heatmap.jsx'
import ChartCard from '../components/charts/ChartCard.jsx'
import StackedBarChart from '../components/charts/StackedBarChart.jsx'
import InsightsSections from '../components/charts/InsightsSections.jsx'
import '../styles/dashboard.css'

const fmtDay = (key) => parseDayKey(key).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
const pct = (v) => (v === null ? '—' : `${v} %`)

export default function Stats() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState('30')
  const [selDay, setSelDay] = useState(null)
  const [selHeat, setSelHeat] = useState(null)
  const [selChapter, setSelChapter] = useState(null)
  const d = useDashboard(period)

  if (!d) return <div className="page" />

  const k = d.kpi
  const sel = d.daily.find((r) => r.day === selDay)
  const dayReadout = sel
    ? `${fmtDay(sel.day)} · ` +
      (sel.cards || sel.readMs
        ? [
            sel.cards ? `${sel.rate} % · ${sel.cards} cartes` : 'aucune carte',
            `${formatDuration(sel.studyMs)} de flashcards`,
            `${formatDuration(sel.readMs)} de cours`,
            `${formatDuration(sel.appMs)} dans l’app`,
          ].join(' · ')
        : 'aucune révision')
    : 'Touchez un graphique pour lire les valeurs du jour'
  const heatCell = d.heat.find((c) => c.day === selHeat)
  const heatReadout = heatCell
    ? `${fmtDay(heatCell.day)} · ${heatCell.level < 0 ? 'à venir' : `${heatCell.count} cartes`}`
    : 'Touchez une case pour le détail'
  const chapterSel = d.chapters.find((c) => c.id === selChapter)
  const maxAttempts = Math.max(1, ...d.chapters.map((c) => c.attempts))
  const studiedDays = d.daily.filter((r) => r.cards > 0 || r.readMs > 0).length
  const studyAll = k.studyMsTotal + k.readMs // flashcards + lecture du cours
  const readShare = studyAll ? Math.round((100 * k.readMs) / studyAll) : 0

  function changePeriod(p) {
    setPeriod(p)
    setSelDay(null)
  }

  return (
    <div className="page dashboard">
      <header className="page-header">
        <h1 className="large-title">Statistiques</h1>
      </header>

      <PeriodControl value={period} onChange={changePeriod} />

      <div className="kpi9">
        <Kpi value={k.total} label="Cartes révisées" />
        <Kpi value={k.good} label="✓ Bonnes" />
        <Kpi value={k.bad} label="✗ Mauvaises" />
        <Kpi value={pct(k.rate)} label="Réussite" />
        <Kpi value={k.sessions} label="Sessions" />
        <Kpi value={k.daysStudied} label="Jours étudiés" />
        <Kpi value={`${k.chaptersWorked}/18`} label="Chapitres vus" />
        <Kpi value={k.cardsRemaining} label="À maîtriser" />
        <Kpi value={formatDuration(studyAll)} label="Temps d’étude" />
      </div>

      {k.total === 0 && <p className="card muted small">Pas encore de révision sur cette période : les graphiques se rempliront au fil de vos sessions.</p>}

      <h2 className="section-title">Progression</h2>

      <ChartCard title="Taux de réussite par jour" aside={`moy. ${pct(k.rate)}`} readout={dayReadout}>
        <LineChart
          points={d.daily.map((r) => ({ key: r.day, value: r.rate }))}
          selectedKey={selDay}
          onSelect={setSelDay}
          ariaLabel="Évolution du taux de réussite quotidien"
        />
      </ChartCard>

      <ChartCard title="Cartes révisées par jour" aside={`${k.total} au total`} readout={dayReadout}>
        <BarChart
          bars={d.daily.map((r) => ({ key: r.day, value: r.cards, label: fmtDay(r.day) }))}
          selectedKey={selDay}
          onSelect={setSelDay}
          ariaLabel="Nombre de cartes révisées chaque jour"
        />
      </ChartCard>

      <ChartCard
        title="Temps d’étude par jour"
        aside={`moy. ${formatDuration(studiedDays ? studyAll / studiedDays : 0)} / jour étudié`}
        readout={dayReadout}
      >
        <div className="legend muted tiny">
          <span><i style={{ background: 'var(--chart-violet)' }} />Flashcards</span>
          <span><i style={{ background: 'var(--chart-blue)' }} />Lecture du cours</span>
        </div>
        <StackedBarChart
          bars={d.daily.map((r) => ({
            key: r.day,
            label: fmtDay(r.day),
            segments: [
              { value: r.studyMs / 60000, color: 'var(--chart-violet)', selectedColor: '#cba6f5' },
              { value: r.readMs / 60000, color: 'var(--chart-blue)', selectedColor: '#a9bdff' },
            ],
          }))}
          selectedKey={selDay}
          onSelect={setSelDay}
          ariaLabel="Minutes d’étude chaque jour, flashcards et lecture du cours"
        />
        <div className="time-split">
          <div>
            <span className="time-split-value">{formatDuration(k.studyMsTotal)}</span>
            <span className="muted tiny">Flashcards · {100 - readShare} %</span>
          </div>
          <div>
            <span className="time-split-value">{formatDuration(k.readMs)}</span>
            <span className="muted tiny">Lecture du cours · {readShare} %</span>
          </div>
          <div>
            <span className="time-split-value">{formatDuration(k.appMs)}</span>
            <span className="muted tiny">Temps dans l’app</span>
          </div>
        </div>
      </ChartCard>

      <ChartCard title="Régularité" aside={`série ${d.streak.current} j · record ${d.streak.best} j`} readout={heatReadout}>
        <Heatmap cells={d.heat} selectedKey={selHeat} onSelect={setSelHeat} />
      </ChartCard>

      <h2 className="section-title">Par chapitre</h2>

      <ChartCard title="Bonnes réponses / tentatives">
        <div className="legend muted tiny">
          <span><i style={{ background: 'var(--chart-blue)' }} />Bonnes</span>
          <span><i style={{ background: '#3a3a3c' }} />Tentatives</span>
        </div>
        <ul className="hbar-list">
          {d.chapters.map((c) => (
            <li key={c.id}>
              <Link to={`/stats/chapitre/${c.id}`} className="hbar-row">
                <span className="muted small">Ch. {c.id}</span>
                <span className="hbar-track">
                  <span className="hbar-attempts" style={{ width: `${(c.attempts / maxAttempts) * 100}%` }}>
                    <span className="hbar-good" style={{ width: c.attempts ? `${(c.good / c.attempts) * 100}%` : 0 }} />
                  </span>
                </span>
                <span className="small hbar-value">{c.attempts ? `${c.good} / ${c.attempts}` : '—'}</span>
              </Link>
            </li>
          ))}
        </ul>
      </ChartCard>

      <ChartCard
        title="Taux de réussite par chapitre"
        aside={
          <span className="legend-inline">
            <i style={{ background: 'var(--chart-amber)' }} />&lt; 60 %
          </span>
        }
        readout={
          chapterSel ? (
            <Link to={`/stats/chapitre/${chapterSel.id}`} className="readout-link">
              {chapterSel.title} · {pct(chapterSel.rate)} ({chapterSel.good}/{chapterSel.attempts}) — détail ›
            </Link>
          ) : (
            'Touchez une barre pour voir le chapitre'
          )
        }
      >
        <BarChart
          bars={d.chapters.map((c) => ({
            key: c.id,
            value: c.rate || 0,
            label: c.title,
            color: c.rate !== null && c.rate < 60 ? 'var(--chart-amber)' : 'var(--chart-blue)',
          }))}
          selectedKey={selChapter}
          onSelect={setSelChapter}
          height={100}
          ariaLabel="Taux de réussite de chaque chapitre"
        />
        <ChapterAxis />
      </ChartCard>

      <ChartCard title="Sessions par chapitre" readout="Touchez une barre pour ouvrir le chapitre">
        <BarChart
          bars={d.chapters.map((c) => ({ key: c.id, value: c.sessions, label: c.title }))}
          onSelect={(id) => id && navigate(`/stats/chapitre/${id}`)}
          color="var(--chart-amber)"
          selectedColor="#e0a060"
          showValues
          ariaLabel="Nombre de sessions par chapitre"
        />
        <ChapterAxis />
      </ChartCard>

      <InsightsSections />
    </div>
  )
}

function Kpi({ value, label }) {
  return (
    <div className="card kpi">
      <span className="kpi-value">{value}</span>
      <span className="muted tiny">{label}</span>
    </div>
  )
}

function ChapterAxis() {
  return (
    <div className="chapter-axis muted">
      {Array.from({ length: 18 }, (_, i) => (
        <span key={i}>{i + 1}</span>
      ))}
    </div>
  )
}
