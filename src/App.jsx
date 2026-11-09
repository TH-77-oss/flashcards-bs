// Squelette de l'application : la zone de contenu (qui change selon l'adresse)
// et la barre d'onglets, masquée pendant une session et dans l'éditeur.
import { Routes, Route, Navigate, useLocation } from 'react-router'
import TabBar from './components/TabBar.jsx'
import Home from './pages/Home.jsx'
import Chapters from './pages/Chapters.jsx'
import ChapterDetail from './pages/ChapterDetail.jsx'
import Session from './pages/Session.jsx'
import CardEditor from './pages/CardEditor.jsx'
import Stats from './pages/Stats.jsx'
import ChapterStats from './pages/ChapterStats.jsx'
import Planning from './pages/Planning.jsx'
import { useAppUsage } from './hooks/useAppUsage.js'
import UpdatePrompt from './components/UpdatePrompt.jsx'

export default function App() {
  useAppUsage() // compte le temps passé dans l'app, sur toutes les pages
  const { pathname } = useLocation()
  const fullScreen = pathname.startsWith('/session') || pathname.startsWith('/cartes')

  return (
    <div className="app">
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chapitres" element={<Chapters />} />
          <Route path="/chapitres/:id" element={<ChapterDetail />} />
          <Route path="/session/:chapterId" element={<Session />} />
          <Route path="/cartes/nouvelle/:chapterId" element={<CardEditor />} />
          <Route path="/cartes/:id" element={<CardEditor />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/stats/chapitre/:id" element={<ChapterStats />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!fullScreen && <TabBar />}
      <UpdatePrompt />
    </div>
  )
}
