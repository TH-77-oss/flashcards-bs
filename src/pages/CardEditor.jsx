// Création et modification d'une carte.
//   /cartes/nouvelle/3 → nouvelle carte dans le chapitre 3
//   /cartes/ex-3-2     → modification de la carte "ex-3-2"
import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { useCard, useChapters } from '../hooks/useData.js'
import { useImageUrl } from '../hooks/useImageUrl.js'
import { saveCard, deleteCard, saveImage, deleteImage } from '../db/repository.js'
import { CATEGORIES } from '../data/sampleCards.js'
import { compressImage } from '../lib/image.js'
import { newId } from '../lib/id.js'
import '../styles/editor.css'

export default function CardEditor() {
  const { id, chapterId } = useParams()
  const isNew = !id
  const existing = useCard(id)
  const chapters = useChapters()

  if (!chapters || (!isNew && existing === undefined)) return <div className="page" />
  if (!isNew && !existing) return <Navigate to="/chapitres" replace />

  const initial = isNew
    ? { chapterId: Number(chapterId) || 1, category: 'definition', question: '', answer: '', image: null, imageId: null }
    : existing

  return <EditorForm key={id || 'new'} initial={initial} isNew={isNew} chapters={chapters} />
}

function EditorForm({ initial, isNew, chapters }) {
  const navigate = useNavigate()
  const fileInput = useRef(null)
  const [chapterId, setChapterId] = useState(initial.chapterId)
  const [category, setCategory] = useState(initial.category)
  const [question, setQuestion] = useState(initial.question)
  const [answer, setAnswer] = useState(initial.answer)
  const [imageId, setImageId] = useState(initial.imageId)
  const [image, setImage] = useState(initial.image)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  // Images ajoutées pendant cette édition : supprimées si on annule.
  const addedImages = useRef([])

  const imageUrl = useImageUrl({ imageId, image })
  const backTo = `/chapitres/${initial.chapterId}`
  const canSave = question.trim() && answer.trim() && !busy

  async function onPickImage(event) {
    const file = event.target.files[0]
    event.target.value = ''
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const compressed = await compressImage(file)
      const id = await saveImage(compressed)
      addedImages.current.push(id)
      setImageId(id)
      setImage(null)
    } catch (err) {
      setError(`Image non ajoutée : ${err.message}`)
    } finally {
      setBusy(false)
    }
  }

  function removeImage() {
    setImageId(null)
    setImage(null)
  }

  async function onSave() {
    if (!canSave) return
    setBusy(true)
    const now = Date.now()
    const card = {
      ...initial,
      chapterId,
      category,
      question: question.trim(),
      answer: answer.trim(),
      imageId,
      image,
    }
    if (isNew) Object.assign(card, { id: `user-${newId()}`, source: 'user', deleted: false, createdAt: now })
    await saveCard(card)
    // Ménage : l'ancienne image et les images essayées puis abandonnées.
    const unused = [initial.imageId, ...addedImages.current].filter((x) => x && x !== imageId)
    await Promise.all(unused.map(deleteImage))
    navigate(`/chapitres/${chapterId}`)
  }

  async function onCancel() {
    await Promise.all(addedImages.current.map(deleteImage))
    navigate(backTo)
  }

  async function onDelete() {
    if (!window.confirm('Supprimer cette carte ? Vos réponses passées restent comptées dans les statistiques.')) return
    await Promise.all(addedImages.current.map(deleteImage))
    await deleteCard(initial)
    navigate(backTo)
  }

  return (
    <div className="page editor">
      <header className="editor-bar">
        <button className="text-button" onClick={onCancel}>
          Annuler
        </button>
        <span className="editor-title">{isNew ? 'Nouvelle carte' : 'Modifier la carte'}</span>
        <button className="text-button strong" onClick={onSave} disabled={!canSave}>
          Enregistrer
        </button>
      </header>

      <label className="field">
        <span className="field-label">Chapitre</span>
        <select value={chapterId} onChange={(e) => setChapterId(Number(e.target.value))}>
          {chapters.map((ch) => (
            <option key={ch.id} value={ch.id}>
              {ch.title}
            </option>
          ))}
        </select>
      </label>

      <div className="field">
        <span className="field-label">Catégorie</span>
        <div className="chip-grid" role="radiogroup" aria-label="Catégorie">
          {Object.entries(CATEGORIES).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={category === key}
              className={'chip-option' + (category === key ? ' is-selected' : '')}
              onClick={() => setCategory(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <label className="field">
        <span className="field-label">Question (recto)</span>
        <textarea rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ex. : Pourquoi…" />
      </label>

      <label className="field">
        <span className="field-label">Réponse (verso)</span>
        <textarea rows={6} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Réponse détaillée mais concise" />
      </label>

      <div className="field">
        <span className="field-label">Image (graphique, tableau, schéma)</span>
        {imageUrl ? (
          <div className="image-preview">
            <img src={imageUrl} alt="Aperçu de l’image de la carte" />
            <div className="button-row">
              <button className="button-secondary" onClick={() => fileInput.current.click()} disabled={busy}>
                Remplacer
              </button>
              <button className="button-secondary" onClick={removeImage} disabled={busy}>
                Retirer
              </button>
            </div>
          </div>
        ) : (
          <button className="button-secondary" onClick={() => fileInput.current.click()} disabled={busy}>
            {busy ? 'Compression…' : 'Ajouter une image'}
          </button>
        )}
        <input ref={fileInput} type="file" accept="image/*" hidden onChange={onPickImage} />
      </div>

      {error && <p className="small ko">{error}</p>}

      {!isNew && (
        <button className="button-danger" onClick={onDelete}>
          Supprimer la carte
        </button>
      )}

      <Link to={backTo} className="sr-only">
        Retour au chapitre
      </Link>
    </div>
  )
}
