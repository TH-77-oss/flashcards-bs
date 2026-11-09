// Compression d'une photo avant stockage : un visuel de slide n'a pas
// besoin de 12 mégapixels. On réduit à 1400 px maximum (côté le plus long)
// et on encode en WebP (ou JPEG si l'appareil ne sait pas faire de WebP).
// Une photo de 3 Mo descend typiquement à 100–250 Ko.
const toBlob = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality))

export async function compressImage(file, maxSize = 1400, quality = 0.82) {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('Image illisible'))
      i.src = url
    })
    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight))
    const width = Math.round(img.naturalWidth * scale)
    const height = Math.round(img.naturalHeight * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff' // fond blanc : les zones transparentes des slides restent lisibles
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)

    let blob = await toBlob(canvas, 'image/webp', quality)
    if (!blob || blob.type !== 'image/webp') blob = await toBlob(canvas, 'image/jpeg', quality)
    return { blob, width, height }
  } finally {
    URL.revokeObjectURL(url)
  }
}
