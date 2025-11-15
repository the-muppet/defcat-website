// components/mobile/MobileCardList.tsx
'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { memo, useState } from 'react'
import { CardPreview } from '@/components/decks'
import { cn } from '@/lib/utils'
import type { DecklistCardWithCard } from '@/types/supabase'

interface MobileCardListProps {
  cards: DecklistCardWithCard[]
  selectedType: string | null
  onTypeSelect: (type: string) => void
}

function CardTypeSection({
  type,
  typeCards,
  isExpanded,
  onToggle,
}: {
  type: string
  typeCards: DecklistCardWithCard[]
  isExpanded: boolean
  onToggle: () => void
}) {
  const cardCount = typeCards.reduce((sum, dc) => sum + dc.quantity, 0)
  const displayLabel = type === 'Commander' && cardCount === 1 ? 'Commander' : `${type}s`

  return (
    <div>
      {/* Sticky Section Header */}
      <div className="sticky top-0 z-10 glass-tinted-strong border-b border-tinted/50">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-4 py-3 transition-smooth active:scale-98 touch-target"
        >
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-tinted">
              {displayLabel}
            </h3>
            <span className="badge-tinted px-2 py-1 rounded-md text-xs font-bold">
              {cardCount}
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-tinted" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Card List - Collapsible */}
      {isExpanded && (
        <div className="px-3 py-3 space-y-1 bg-background/50 animate-in slide-in-from-top duration-150">
          {typeCards.map((dc, idx) => (
            <CardPreview
              key={`${dc.cards?.name || 'unknown'}-${idx}`}
              card={dc.cards}
              quantity={dc.quantity || 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const MobileCardList = memo(function MobileCardList({
  cards,
  selectedType,
  onTypeSelect,
}: MobileCardListProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['Commander', 'Creature', 'Instant', 'Sorcery'])
  )

  const CARD_TYPES = [
    'Commander',
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

  const toggleSection = (type: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedSections(new Set(CARD_TYPES))
  }

  const collapseAll = () => {
    setExpandedSections(new Set())
  }

  const totalCards = cards.reduce((sum, dc) => sum + dc.quantity, 0)

  return (
    <div>
      {/* Quick Actions Bar - Sticky */}
      <div className="sticky top-0 z-20 glass-tinted-strong border-b border-tinted px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground font-semibold">
            {totalCards} cards
          </span>
          <div className="flex gap-4">
            <button
              onClick={expandAll}
              className="text-sm text-tinted hover:brightness-110 font-bold transition-smooth active:scale-98"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="text-sm text-tinted hover:brightness-110 font-bold transition-smooth active:scale-98"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Card Type Sections */}
      <div className="pb-24">
        {CARD_TYPES.map((type) => {
          const typeCards =
            type === 'Commander'
              ? cards.filter((dc) => dc.board === 'commanders')
              : cards.filter(
                  (dc) => dc.board !== 'commanders' && dc.cards?.type_line?.includes(type)
                )

          if (typeCards.length === 0) return null
          if (selectedType && selectedType !== type) return null

          return (
            <CardTypeSection
              key={type}
              type={type}
              typeCards={typeCards}
              isExpanded={expandedSections.has(type)}
              onToggle={() => toggleSection(type)}
            />
          )
        })}
      </div>
    </div>
  )
})
