// Cartes d'EXEMPLE, en attendant les vraies flashcards générées à partir
// de vos slides (étape 8). À l'étape 5, les cartes seront stockées dans
// la base locale (IndexedDB) et modifiables depuis l'app.

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

// Renvoie les cartes d'un chapitre (ici : les mêmes exemples pour tous).
export function getCardsForChapter(chapterId) {
  return EXAMPLES.map((card, i) => ({
    id: `ex-${chapterId}-${i + 1}`,
    chapterId,
    ...card,
    categoryLabel: CATEGORIES[card.category],
  }))
}
