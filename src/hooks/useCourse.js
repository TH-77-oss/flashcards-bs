// Préférences et suivi du mode « Cours ».
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db.js'

// Langue de lecture (fr / en), mémorisée sur l'appareil.
export function useCourseLang() {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem('coursLang') || 'fr'
    } catch {
      return 'fr'
    }
  })
  function setLang(l) {
    setLangState(l)
    try {
      localStorage.setItem('coursLang', l)
    } catch {
      // stockage indisponible : la préférence ne sera simplement pas retenue
    }
  }
  return [lang, setLang]
}

// Chapitre marqué « lu » ? (stocké dans la base, donc inclus dans la sauvegarde)
export function useCourseRead(chapterId) {
  return useLiveQuery(async () => !!(await db.settings.get(`coursLu-${chapterId}`)), [chapterId])
}

export function setCourseRead(chapterId, read) {
  const key = `coursLu-${chapterId}`
  return read ? db.settings.put({ key, value: Date.now() }) : db.settings.delete(key)
}
