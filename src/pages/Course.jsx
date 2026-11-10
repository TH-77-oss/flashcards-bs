// Mode « Cours » : synthèse détaillée d'un chapitre, en français ou en anglais,
// avec sommaire, visuels des slides, et un bouton à la fin de chaque partie
// pour se tester sur les flashcards de cette partie.
import { useRef } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { getCourse } from '../lib/courses.js'
import { useCourseLang, useCourseRead, setCourseRead } from '../hooks/useCourse.js'
import { useReadingTimer } from '../hooks/useReadingTimer.js'
import '../styles/course.css'

const UI = {
  fr: { back: '‹ Chapitre', min: 'min de lecture', toc: 'Sommaire', test: 'Me tester sur cette partie', cards: 'cartes', take: 'À retenir', read: 'Marquer comme lu', isRead: '✓ Chapitre lu', all: 'Réviser tout le chapitre' },
  en: { back: '‹ Chapter', min: 'min read', toc: 'Contents', test: 'Test myself on this part', cards: 'cards', take: 'Key takeaways', read: 'Mark as read', isRead: '✓ Chapter read', all: 'Review the whole chapter' },
}

export default function Course() {
  const id = Number(useParams().id)
  const course = getCourse(id)
  const [lang, setLang] = useCourseLang()
  const read = useCourseRead(id)
  const refs = useRef({})
  useReadingTimer(id) // compte le temps de lecture de ce chapitre

  if (!course) return <Navigate to={`/chapitres/${id}`} replace />
  const t = UI[lang]

  return (
    <div className="page course">
      <div className="course-bar">
        <Link to={`/chapitres/${id}`} className="back-link">
          {t.back}
        </Link>
        <div className="lang-switch" role="radiogroup" aria-label="Langue">
          {['fr', 'en'].map((l) => (
            <button key={l} role="radio" aria-checked={lang === l} className={lang === l ? 'is-selected' : ''} onClick={() => setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <header className="page-header">
        <p className="eyebrow">
          {lang === 'fr' ? 'Chapitre' : 'Chapter'} {id} · {course.readMinutes[lang]} {t.min}
        </p>
        <h1 className="large-title course-title">{course.title[lang]}</h1>
      </header>

      <nav className="card course-toc" aria-label={t.toc}>
        <p className="section-label">{t.toc}</p>
        <ol>
          {course.sections.map((s) => (
            <li key={s.id}>
              <button onClick={() => refs.current[s.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>{s.title[lang]}</button>
            </li>
          ))}
        </ol>
      </nav>

      {course.sections.map((s, i) => (
        <section key={s.id} ref={(el) => (refs.current[s.id] = el)} className="course-section">
          <h2 className="course-h2">
            <span className="course-num">{i + 1}</span>
            {s.title[lang]}
          </h2>
          {s.blocks[lang].map((b, k) => (
            <Block key={k} b={b} />
          ))}
          <Link to={`/session/${id}?partie=${s.id}`} className="course-test">
            {t.test} · {s.cards.length} {t.cards} ›
          </Link>
        </section>
      ))}

      <section className="card course-take">
        <p className="section-label">{t.take}</p>
        <ul>
          {course.takeaways[lang].map((x, k) => (
            <li key={k}>
              <Inline text={x} />
            </li>
          ))}
        </ul>
      </section>

      <button className={read ? 'button-secondary course-read is-read' : 'button-secondary course-read'} onClick={() => setCourseRead(id, !read)}>
        {read ? t.isRead : t.read}
      </button>
      <Link to={`/session/${id}`} className="button-primary">
        {t.all}
      </Link>
    </div>
  )
}

// Un bloc de contenu : paragraphe, liste, encadré « notion clé », exemple ou image.
function Block({ b }) {
  if (b.t === 'p') return <p className="course-p"><Inline text={b.x} /></p>
  if (b.t === 'list')
    return (
      <div className="course-list">
        {b.h && <p className="course-list-title">{b.h}</p>}
        <ul>
          {b.x.map((item, k) => (
            <li key={k}>
              <Inline text={item} />
            </li>
          ))}
        </ul>
      </div>
    )
  if (b.t === 'key' || b.t === 'example')
    return (
      <div className={b.t === 'key' ? 'course-box key' : 'course-box example'}>
        <p className="course-box-title">{b.h}</p>
        <p className="course-box-text"><Inline text={b.x} /></p>
      </div>
    )
  if (b.t === 'image')
    return (
      <figure className="course-figure">
        <img src={`${import.meta.env.BASE_URL}images/${b.src}`} alt={b.x} loading="lazy" />
        <figcaption className="muted small">{b.x}</figcaption>
      </figure>
    )
  return null
}

// Mise en forme légère : **gras**, *italique* (termes techniques) et retours à la ligne.
function Inline({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((p, i) => {
    if (p.startsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>
    if (p.startsWith('*') && p.length > 1) return <em key={i}>{p.slice(1, -1)}</em>
    return <span key={i}>{p}</span>
  })
}
