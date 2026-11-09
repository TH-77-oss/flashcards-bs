// Point d'entrée : prépare la base locale, puis monte l'application React.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import App from './App.jsx'
import { initDb } from './db/db.js'
import './styles/theme.css'
import './styles/components.css'

const root = createRoot(document.getElementById('root'))

// On attend que la base soit prête (chapitres et cartes de départ insérés)
// avant d'afficher l'app, pour ne jamais montrer un écran vide.
initDb()
  .catch((err) => console.error('Initialisation de la base impossible', err))
  .finally(() => {
    root.render(
      <StrictMode>
        {/* HashRouter : adresses du type /#/stats, compatibles avec tout hébergement statique */}
        <HashRouter>
          <App />
        </HashRouter>
      </StrictMode>,
    )
  })
