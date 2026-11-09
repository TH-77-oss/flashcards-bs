// Bandeau « Nouvelle version disponible ». Quand vous publiez une mise à jour
// (nouveaux chapitres, corrections), l'app installée la détecte et propose de
// l'installer. Vos données (réponses, planning…) ne sont jamais touchées :
// seul le code et le contenu de l'app sont remplacés.
import { useRegisterSW } from 'virtual:pwa-register/react'
import '../styles/pwa.css'

const CHECK_EVERY_MS = 60 * 60 * 1000 // vérifie la présence d'une mise à jour toutes les heures

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (registration) setInterval(() => registration.update(), CHECK_EVERY_MS)
    },
  })

  if (!needRefresh) return null

  return (
    <div className="update-banner" role="status">
      <span>Nouvelle version disponible</span>
      <button className="update-now" onClick={() => updateServiceWorker(true)}>
        Mettre à jour
      </button>
      <button className="update-later" onClick={() => setNeedRefresh(false)} aria-label="Plus tard">
        ✕
      </button>
    </div>
  )
}
