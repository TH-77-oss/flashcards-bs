// Carte recto/verso. Les deux faces sont superposées ; la carte entière
// pivote de 180° quand flipped vaut true (voir .is-flipped dans session.css).
// - Image éventuelle (graphique, tableau…) au recto, sous la question.
// - Votre note : toujours au verso, sous la réponse officielle ;
//   au recto seulement si vous demandez l'indice (showHint).
import { useImageUrl } from '../hooks/useImageUrl.js'

export default function FlipCard({ card, flipped, onFlip, note, showHint }) {
  const imageUrl = useImageUrl(card)

  return (
    <div className="flip-scene">
      <button
        type="button"
        className={'flip-card' + (flipped ? ' is-flipped' : '')}
        onClick={onFlip}
        aria-label={flipped ? 'Revenir à la question' : 'Afficher la réponse'}
      >
        <span className="flip-face flip-front" aria-hidden={flipped}>
          <span className="flip-chips">
            <span className="chip">{card.categoryLabel}</span>
            {note && <span className="chip chip-note">Note</span>}
          </span>
          <span className={'flip-question' + (imageUrl || showHint ? ' has-image' : '')}>{card.question}</span>
          {imageUrl && <img className="flip-image" src={imageUrl} alt="Illustration de la carte" />}
          {showHint && note && (
            <span className="note-box hint">
              <span className="note-box-label">Indice · ma note</span>
              <span className="note-box-text">{note}</span>
            </span>
          )}
          <span className="flip-hint">Touchez pour voir la réponse</span>
        </span>
        <span className="flip-face flip-back" aria-hidden={!flipped}>
          <span className="flip-label">Réponse</span>
          <span className="flip-answer">{card.answer}</span>
          {note && (
            <span className="note-box">
              <span className="note-box-label">Ma note</span>
              <span className="note-box-text">{note}</span>
            </span>
          )}
        </span>
      </button>
    </div>
  )
}
