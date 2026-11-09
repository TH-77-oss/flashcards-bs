// Mesure du temps passé dans l'app (au premier plan, et pas inactif).
// Toutes les 5 s : si l'app est visible et qu'il y a eu une interaction
// dans les 90 dernières secondes, on compte 5 s. Le total est enregistré
// toutes les 30 s et dès que l'app passe en arrière-plan.
import { useEffect } from 'react'
import { addAppTime } from '../db/repository.js'

const TICK_MS = 5000
const IDLE_MS = 90 * 1000
const FLUSH_MS = 30 * 1000
const ACTIVITY_EVENTS = ['pointerdown', 'touchstart', 'keydown', 'scroll']

export function useAppUsage() {
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
        addAppTime(ms).catch(() => {})
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
      flush()
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity, { capture: true }))
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', flush)
    }
  }, [])
}
