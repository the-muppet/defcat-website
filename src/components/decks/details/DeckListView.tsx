// components/decks/detail/DeckListView.tsx
import { TypeFilterBar } from './TypeFilterBar'
import { CardPreview } from '@/components/decks'
import type { DecklistCardWithCard } from '@/types/supabase'

interface DeckListViewProps {
  cards: DecklistCardWithCard[]
  selectedType: string | null
  onTypeSelect: (type: string) => void
}

function CardTypeSection({ type, typeCards }: { type: string; typeCards: DecklistCardWithCard[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-primary/20">
        <h3 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
          <span className="text-primary">{type}s</span>
        </h3>
        <span className="text-xs md:text-sm font-semibold text-primary bg-primary/10 px-2 md:px-3 py-1 rounded-full">
          {typeCards.reduce((sum, dc) => sum + dc.quantity, 0)} cards
        </span>
      </div>

      <div className="space-y-1">
        {typeCards.map((dc, idx) => (
          <CardPreview
            key={`${dc.cards?.name || 'unknown'}-${idx}`}
            card={dc.cards}
            quantity={dc.quantity || 0}
          />
        ))}
      </div>
    </div>
  )
}

export function DeckListView({ cards, selectedType, onTypeSelect }: DeckListViewProps) {
  const CARD_TYPES = [
    'Creature',
    'Instant',
    'Sorcery',
    'Artifact',
    'Enchantment',
    'Planeswalker',
    'Battle',
    'Tribal',
    'Land',
  ]

  return (
    <>
      <TypeFilterBar cards={cards} selectedType={selectedType} onTypeSelect={onTypeSelect} />

      <div className="space-y-8 max-h-[400px] sm:max-h-[500px] md:max-h-[600px] lg:max-h-[700px] overflow-y-auto">
        {CARD_TYPES.map((type) => {
          const typeCards = cards.filter((dc) => dc.cards?.type_line?.includes(type))
          if (typeCards.length === 0) return null

          // Hide section if a different type is selected
          if (selectedType && selectedType !== type) return null

          return <CardTypeSection key={type} type={type} typeCards={typeCards} />
        })}
      </div>
    </>
  )
}