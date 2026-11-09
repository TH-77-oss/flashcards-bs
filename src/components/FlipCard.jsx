// Carte recto/verso. Les deux faces sont superposées ; la carte entière
// pivote de 180° quand flipped vaut true (voir .is-flipped dans session.css).
export default function FlipCard({ card, flipped, onFlip }) {
  return (
    <div className="flip-scene">
      <button
        type="button"
        className={'flip-card' + (flipped ? ' is-flipped' : '')}
        onClick={onFlip}
        aria-label={flipped ? 'Revenir à la question' : 'Afficher la réponse'}
      >
        <span className="flip-face flip-front" aria-hidden={flipped}>
          <span className="chip">{card.categoryLabel}</span>
          <span className="flip-question">{card.question}</span>
          <span className="flip-hint">Touchez pour voir la réponse</span>
        </span>
        <span className="flip-face flip-back" aria-hidden={!flipped}>
          <span className="flip-label">Réponse</span>
          <span className="flip-answer">{card.answer}</span>
        </span>
      </button>
    </div>
  )
}
