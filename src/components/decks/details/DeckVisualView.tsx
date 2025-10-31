// components/decks/detail/DeckVisualView.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { TypeFilterBar } from './TypeFilterBar'
import type { DecklistCardWithCard } from '@/types/supabase'

interface DeckVisualViewProps {
  cards: DecklistCardWithCard[]
  selectedType: string | null
  onTypeSelect: (type: string) => void
}

export function DeckVisualView({ cards, selectedType, onTypeSelect }: DeckVisualViewProps) {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set())
  const [columns, setColumns] = useState(4)
  const visualGridRef = useRef<HTMLDivElement>(null)

  const toggleCardFlip = (cardName: string) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(cardName)) {
        newSet.delete(cardName)
      } else {
        newSet.add(cardName)
      }
      return newSet
    })
  }

  // Clear manual flips when filter changes
  useEffect(() => {
    setFlippedCards(new Set())
  }, [selectedType])

  // Responsive column detection
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width < 640) setColumns(2)
      else if (width < 768) setColumns(3)
      else setColumns(4)
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  // Filter and prepare cards
  const visualCards = cards
    .filter((dc) => !selectedType || dc.cards?.type_line?.includes(selectedType))
    .filter((dc) => {
      const frontImageUrl =
        dc.cards?.cached_image_url ||
        (dc.cards?.scryfall_id
          ? `https://cards.scryfall.io/normal/front/${dc.cards.scryfall_id[0]}/${dc.cards.scryfall_id[1]}/${dc.cards.scryfall_id}.jpg`
          : null)
      return frontImageUrl !== null
    })

  // Group cards into rows
  const cardRows: typeof visualCards[] = []
  for (let i = 0; i < visualCards.length; i += columns) {
    cardRows.push(visualCards.slice(i, i + columns))
  }

  // Virtual grid setup
  const rowVirtualizer = useVirtualizer({
    count: cardRows.length,
    getScrollElement: () => visualGridRef.current,
    estimateSize: () => 400,
    overscan: 2,
  })

  return (
    <>
      <TypeFilterBar cards={cards} selectedType={selectedType} onTypeSelect={onTypeSelect} />

      <div ref={visualGridRef} className="h-[600px] overflow-auto">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = cardRows[virtualRow.index]
            return (
              <div
                key={virtualRow.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div
                  className="gap-4 px-1"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  }}
                >
                  {row.map((dc, idx) => {
                    const isDFC = dc.cards?.type_line?.includes('//')
                    const cardName = dc.cards?.name || ''
                    const typeLine = dc.cards?.type_line || ''

                    // Auto-flip based on filter for DFCs
                    let autoFlip = false
                    if (isDFC && selectedType) {
                      const [frontType, backType] = typeLine.split('//').map((t) => t.trim())
                      if (backType.includes(selectedType) && !frontType.includes(selectedType)) {
                        autoFlip = true
                      }
                    }

                    const manuallyFlipped = flippedCards.has(cardName)
                    const isFlipped = autoFlip ? !manuallyFlipped : manuallyFlipped

                    const frontImageUrl =
                      dc.cards?.cached_image_url ||
                      (dc.cards?.scryfall_id
                        ? `https://cards.scryfall.io/normal/front/${dc.cards.scryfall_id[0]}/${dc.cards.scryfall_id[1]}/${dc.cards.scryfall_id}.jpg`
                        : null)

                    const backImageUrl = dc.cards?.scryfall_id
                      ? `https://cards.scryfall.io/normal/back/${dc.cards.scryfall_id[0]}/${dc.cards.scryfall_id[1]}/${dc.cards.scryfall_id}.jpg`
                      : null

                    return frontImageUrl ? (
                      <div key={idx} className="relative group" style={{ perspective: '1000px' }}>
                        <div
                          className="relative rounded-lg border-2 border-border hover:border-primary shadow-lg transition-all duration-600"
                          style={{
                            transformStyle: 'preserve-3d',
                            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                            transition: 'transform 0.6s',
                          }}
                        >
                          {/* Front Face */}
                          <div
                            className="relative w-full"
                            style={{
                              backfaceVisibility: 'hidden',
                              WebkitBackfaceVisibility: 'hidden',
                            }}
                          >
                            <img
                              src={frontImageUrl}
                              alt={dc.cards?.name || ''}
                              className="w-full h-auto rounded-lg"
                            />
                            {dc.quantity > 1 && (
                              <div className="absolute top-2 right-2 bg-primary text-primary-foreground font-bold text-sm rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                                {dc.quantity}
                              </div>
                            )}
                          </div>

                          {/* Back Face */}
                          {isDFC && backImageUrl && (
                            <div
                              className="absolute top-0 left-0 w-full h-full"
                              style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                              }}
                            >
                              <img
                                src={backImageUrl}
                                alt={`${dc.cards?.name || ''} (back)`}
                                className="w-full h-auto rounded-lg"
                              />
                              {dc.quantity > 1 && (
                                <div className="absolute top-2 right-2 bg-primary text-primary-foreground font-bold text-sm rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                                  {dc.quantity}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* DFC Flip Button */}
                        {isDFC && (
                          <button
                            onClick={() => toggleCardFlip(cardName)}
                            className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center shadow-lg hover:bg-black/90 transition-colors cursor-pointer z-20"
                            title={isFlipped ? 'Show front face' : 'Show back face'}
                          >
                            <i
                              className="ms ms-ability-duels-dfc text-white"
                              style={{ fontSize: '16px' }}
                            />
                          </button>
                        )}
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}