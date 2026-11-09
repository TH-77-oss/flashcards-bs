// Point d'entrée : monte l'application React dans <div id="root">.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import App from './App.jsx'
import './styles/theme.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* HashRouter : les adresses ressemblent à /#/stats, ce qui fonctionne
        sur n'importe quel hébergement statique sans configuration. */}
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
