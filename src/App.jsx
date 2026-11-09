// Squelette de l'application : la zone de contenu (qui change selon l'adresse)
// et la barre d'onglets, masquée pendant une session de révision.
import { Routes, Route, Navigate, useLocation } from 'react-router'
import TabBar from './components/TabBar.jsx'
import Home from './pages/Home.jsx'
import Chapters from './pages/Chapters.jsx'
import ChapterDetail from './pages/ChapterDetail.jsx'
import Session from './pages/Session.jsx'
import Stats from './pages/Stats.jsx'
import Planning from './pages/Planning.jsx'

export default function App() {
  const { pathname } = useLocation()
  const inSession = pathname.startsWith('/session')

  return (
    <div className="app">
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chapitres" element={<Chapters />} />
          <Route path="/chapitres/:id" element={<ChapterDetail />} />
          <Route path="/session/:chapterId" element={<Session />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/planning" element={<Planning />} />
          {/* Toute adresse inconnue renvoie à l'accueil */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {/* Mode concentration : pas de tab bar pendant une session */}
      {!inSession && <TabBar />}
    </div>
  )
}
