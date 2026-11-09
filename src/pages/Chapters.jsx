import { Link } from 'react-router'
import { useStats } from '../hooks/useData.js'
import { IconChevron } from '../components/Icons.jsx'

function subtitle(ch) {
  if (ch.cards === 0) return 'Pas encore de cartes'
  if (ch.attempts === 0) return `${ch.cards} cartes · pas encore révisé`
  return `${ch.rate} % de réussite · ${ch.mastered}/${ch.cards} maîtrisées`
}

export default function Chapters() {
  const stats = useStats()
  if (!stats) return <div className="page" />

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="large-title">Chapitres</h1>
      </header>

      <ul className="grouped-list">
        {stats.chapters.map((ch) => (
          <li key={ch.id}>
            <Link to={`/chapitres/${ch.id}`} className="list-row">
              <span className={'badge' + (ch.isMastered ? ' badge-ok' : '')}>{ch.id}</span>
              <span className="list-row-text">
                <span>{ch.title}</span>
                <span className="muted small">{subtitle(ch)}</span>
                <span className="mini-bar" aria-hidden="true">
                  <span className="mini-bar-fill" style={{ width: `${ch.masteryPct}%` }} />
                </span>
              </span>
              <span className="chevron">
                <IconChevron />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
