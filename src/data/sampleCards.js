// Contenu de départ (« seed ») inséré dans la base au premier lancement.
// Pour l'instant : 3 cartes d'EXEMPLE par chapitre. À l'étape 8, elles
// seront remplacées par les vraies flashcards générées à partir des slides.

export const CATEGORIES = {
  definition: 'Définition',
  graphique: 'Graphique',
  tableau: 'Tableau',
  formule: 'Formule',
  application: 'Application',
  raisonnement: 'Raisonnement',
}

const EXAMPLES = [
  {
    category: 'definition',
    question: 'Qu’est-ce qu’un avantage concurrentiel durable ?',
    answer:
      'La capacité d’une entreprise à créer plus de valeur économique que ses concurrents — un écart plus grand entre la disposition à payer des clients et ses coûts — de manière à résister à l’imitation dans le temps.',
  },
  {
    category: 'raisonnement',
    question:
      'Pourquoi, en concurrence à la Bertrand avec produits homogènes, le prix converge-t-il vers le coût marginal ?',
    answer:
      'Chaque firme capte tout le marché en baissant légèrement son prix. Cette sous-enchère continue tant que le prix dépasse le coût marginal, et s’arrête quand plus aucune baisse n’est rentable.',
  },
  {
    category: 'formule',
    question: 'Indice de Lerner : formule et interprétation ?',
    answer:
      'L = (P − Cm) / P = 1 / |ε|\n\nIl mesure le pouvoir de marché : plus la demande est inélastique, plus la marge relative que l’entreprise peut appliquer est élevée.',
  },
]

// Toutes les cartes de départ, pour les 18 chapitres.
// L'id est stable ("ex-3-2") : relancer l'app ne crée jamais de doublon.
export function buildSeedCards() {
  const now = Date.now()
  const cards = []
  for (let chapterId = 1; chapterId <= 18; chapterId++) {
    EXAMPLES.forEach((card, i) => {
      cards.push({
        id: `ex-${chapterId}-${i + 1}`,
        chapterId,
        ...card,
        imageId: null,
        source: 'seed', // 'seed' = fourni avec l'app ; 'user' = créé par vous
        deleted: false, // une carte supprimée est marquée, pas effacée (voir db.js)
        createdAt: now,
        updatedAt: now,
      })
    })
  }
  return cards
}
