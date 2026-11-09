// Sauvegarde et restauration de TOUTES les données dans un fichier JSON.
// C'est la vraie assurance : à faire régulièrement (vers iCloud Drive / Fichiers).
import { db } from './db.js'
import { dayKey } from '../lib/dates.js'

const APP_ID = 'flashcards-business-strategy'
const TABLES = ['chapters', 'cards', 'sessions', 'answers', 'usageDaily', 'settings']

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function exportBackup() {
  const data = { app: APP_ID, version: 1, exportedAt: new Date().toISOString(), tables: {} }
  for (const t of TABLES) data.tables[t] = await db.table(t).toArray()
  // Les images sont des fichiers binaires : on les convertit en texte (base64).
  const images = await db.images.toArray()
  data.tables.images = await Promise.all(images.map(async (img) => ({ ...img, blob: await blobToDataUrl(img.blob) })))

  const name = `revisions-sauvegarde-${dayKey()}.json`
  const file = new File([JSON.stringify(data)], name, { type: 'application/json' })

  // Sur iPhone : feuille de partage (« Enregistrer dans Fichiers »).
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Sauvegarde des révisions' })
      return
    } catch (err) {
      if (err.name === 'AbortError') return // l'utilisateur a annulé
    }
  }
  // Sur ordinateur : téléchargement classique.
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Remplace TOUTES les données actuelles par celles du fichier.
export async function importBackup(file) {
  const data = JSON.parse(await file.text())
  if (data.app !== APP_ID) throw new Error('Ce fichier n’est pas une sauvegarde de l’app.')

  // Reconversion des images avant la transaction (Dexie interdit les
  // opérations asynchrones étrangères à la base pendant une transaction).
  const images = await Promise.all(
    (data.tables.images || []).map(async (img) => ({ ...img, blob: await (await fetch(img.blob)).blob() })),
  )

  const all = [...TABLES, 'images']
  await db.transaction('rw', all.map((t) => db.table(t)), async () => {
    for (const t of all) {
      await db.table(t).clear()
      const rows = t === 'images' ? images : data.tables[t] || []
      if (rows.length) await db.table(t).bulkAdd(rows)
    }
  })
}
