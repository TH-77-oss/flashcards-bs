// Donne l'adresse affichable de l'image d'une carte :
//  - image ajoutée depuis l'iPhone (imageId) → lue dans la base, convertie en URL temporaire ;
//  - visuel de slide livré avec l'app (image: "ch03/slide-12.png") → fichier de public/images/.
import { useEffect, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db.js'

export function useImageUrl(card) {
  const imageId = card?.imageId || null
  const blob = useLiveQuery(
    () => (imageId ? db.images.get(imageId).then((r) => r?.blob || null) : null),
    [imageId],
  )
  const blobUrl = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob])
  // Libère la mémoire quand l'image change ou que l'écran se ferme.
  useEffect(() => () => blobUrl && URL.revokeObjectURL(blobUrl), [blobUrl])

  if (imageId) return blobUrl
  if (card?.image) return `${import.meta.env.BASE_URL}images/${card.image}`
  return null
}
