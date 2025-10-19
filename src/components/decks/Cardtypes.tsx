interface DeckCard {
  quantity: number;
  board_type: string;
  cards: {
    name: string;
    mana_cost: string | null;
    type_line: string | null;
    cmc: number | null;
    image_url: string | null;
  } | null;
}

interface TypeDistributionProps {
  deckCards: DeckCard[];
}

export function TypeDistribution({ deckCards }: TypeDistributionProps) {
  const typeDistribution = deckCards.reduce((acc, dc) => {
    const typeLine = dc.cards?.type_line || '';
    let primaryType = 'Other';

    if (typeLine.includes('Creature')) primaryType = 'Creature';
    else if (typeLine.includes('Instant')) primaryType = 'Instant';
    else if (typeLine.includes('Sorcery')) primaryType = 'Sorcery';
    else if (typeLine.includes('Artifact')) primaryType = 'Artifact';
    else if (typeLine.includes('Enchantment')) primaryType = 'Enchantment';
    else if (typeLine.includes('Planeswalker')) primaryType = 'Planeswalker';
    else if (typeLine.includes('Land')) primaryType = 'Land';

    acc[primaryType] = (acc[primaryType] || 0) + dc.quantity;
    return acc;
  }, {} as Record<string, number>);

  const totalCards = deckCards.reduce((sum, dc) => sum + dc.quantity, 0);

  const typeColors: Record<string, string> = {
    'Creature': 'from-green-400 to-green-600',
    'Instant': 'from-blue-400 to-blue-600',
    'Sorcery': 'from-red-400 to-red-600',
    'Artifact': 'from-gray-400 to-gray-600',
    'Enchantment': 'from-purple-400 to-purple-600',
    'Planeswalker': 'from-yellow-400 to-yellow-600',
    'Land': 'from-amber-400 to-amber-600',
    'Other': 'from-slate-400 to-slate-600',
  };

  return (
    <div className="space-y-3">
      {Object.entries(typeDistribution)
        .sort(([, a], [, b]) => b - a)
        .map(([type, count]) => {
          const percentage = ((count / totalCards) * 100).toFixed(1);
          const barPercentage = (count / totalCards) * 100;

          return (
            <div key={type} className="flex items-center gap-4">
              <span className="text-sm font-semibold w-28 text-foreground">{type}</span>
              <div className="flex-1 relative">
                <div className="bg-accent/50 rounded-lg h-10 overflow-hidden border border-border">
                  <div
                    className={`bg-gradient-to-r ${typeColors[type] || typeColors['Other']} h-full transition-all duration-500 flex items-center justify-between px-4`}
                    style={{ width: `${Math.max(barPercentage, 8)}%` }}
                  >
                    <span className="text-sm font-bold text-white drop-shadow-md">{count}</span>
                    <span className="text-sm font-bold text-white drop-shadow-md">{percentage}%</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
