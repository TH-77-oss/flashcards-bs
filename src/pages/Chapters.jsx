import { Link } from 'react-router'
import { CHAPTERS } from '../data/chapters.js'
import { IconChevron } from '../components/Icons.jsx'

export default function Chapters() {
  return (
    <div className="page">
      <header className="page-header">
        <h1 className="large-title">Chapitres</h1>
      </header>

      <ul className="grouped-list">
        {CHAPTERS.map((chapter) => (
          <li key={chapter.id}>
            <Link to={`/chapitres/${chapter.id}`} className="list-row">
              <span className="badge">{chapter.id}</span>
              <span className="list-row-text">
                <span>{chapter.title}</span>
                <span className="muted small">Pas encore de cartes</span>
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
