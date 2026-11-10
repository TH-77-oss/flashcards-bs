// Mesure du temps passé à lire le cours d'un chapitre.
// Même principe que le temps dans l'app : on compte 5 s à chaque tic si la page
// est visible et active. Le seuil d'inactivité est plus long (3 min), car on peut
// lire un long paragraphe sans toucher l'écran.
import { useEffect } from 'react'
import { addReadingTime } from '../db/repository.js'

const TICK_MS = 5000
const IDLE_MS = 3 * 60 * 1000
const FLUSH_MS = 30 * 1000
const ACTIVITY_EVENTS = ['pointerdown', 'touchstart', 'keydown', 'scroll']

export function useReadingTimer(chapterId) {
  useEffect(() => {
    let lastActivity = Date.now()
    let lastFlush = Date.now()
    let buffer = 0

    const onActivity = () => {
      lastActivity = Date.now()
    }
    const flush = () => {
      if (buffer > 0) {
        const ms = buffer
        buffer = 0
        addReadingTime(chapterId, ms).catch(() => {})
      }
      lastFlush = Date.now()
    }
    const tick = () => {
      const now = Date.now()
      if (document.visibilityState === 'visible' && now - lastActivity < IDLE_MS) buffer += TICK_MS
      if (now - lastFlush >= FLUSH_MS) flush()
    }
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush()
      else lastActivity = Date.now()
    }

    const timer = setInterval(tick, TICK_MS)
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true, capture: true }))
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', flush)

    return () => {
      clearInterval(timer)
      flush() // en quittant la page de cours
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity, { capture: true }))
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', flush)
    }
  }, [chapterId])
}
