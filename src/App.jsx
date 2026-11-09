// Squelette de l'application : la zone de contenu (qui change selon l'adresse)
// et la barre d'onglets, toujours visible en bas.
import { Routes, Route, Navigate } from 'react-router'
import TabBar from './components/TabBar.jsx'
import Home from './pages/Home.jsx'
import Chapters from './pages/Chapters.jsx'
import ChapterDetail from './pages/ChapterDetail.jsx'
import Stats from './pages/Stats.jsx'
import Planning from './pages/Planning.jsx'

export default function App() {
  return (
    <div className="app">
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chapitres" element={<Chapters />} />
          <Route path="/chapitres/:id" element={<ChapterDetail />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/planning" element={<Planning />} />
          {/* Toute adresse inconnue renvoie à l'accueil */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <TabBar />
    </div>
  )
}
