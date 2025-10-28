// components/deck/ColorDistribution.tsx
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
'use client'

// biome-ignore assist/source/organizeImports: <explanation>
import { useState } from 'react'
import { ColorIdentity } from '@/types/colors'
import { cn } from '@/lib/utils'

interface DeckCard {
  quantity: number
  board: string
  cards: {
    name: string
    mana_cost: string | null | undefined
    type_line: string | null
    cmc: number | null
    image_url: string | null
    scryfall_id: string | null
  } | null
}

export function ColorDistribution({
  cards,
  selectedType,
}: {
  cards: DeckCard[]
  selectedType?: string | null
}) {
  const [hoveredColor, setHoveredColor] = useState<string | null>(null)
  const [hoveredCombo, setHoveredCombo] = useState<string | null>(null)

  // Filter by selected type if provided
  const filteredCards = selectedType
    ? cards.filter((dc) => dc.cards?.type_line?.includes(selectedType))
    : cards

  // Calculate color distribution based on mana costs (symbol count)
  const colorCounts = filteredCards.reduce(
    (acc, dc) => {
      const manaCost = dc.cards?.mana_cost || ''
      const quantity = dc.quantity

      // Count each color symbol
      if (manaCost.includes('{W}')) acc.W = (acc.W || 0) + quantity
      if (manaCost.includes('{U}')) acc.U = (acc.U || 0) + quantity
      if (manaCost.includes('{B}')) acc.B = (acc.B || 0) + quantity
      if (manaCost.includes('{R}')) acc.R = (acc.R || 0) + quantity
      if (manaCost.includes('{G}')) acc.G = (acc.G || 0) + quantity
      if (!manaCost || manaCost === '' || /^{\d+}$/.test(manaCost)) {
        acc.C = (acc.C || 0) + quantity // Colorless
      }

      return acc
    },
    {} as Record<string, number>
  )

  // Calculate color combo distribution
  const colorCombos = filteredCards.reduce(
    (acc, dc) => {
      const colors = ColorIdentity.extractColorsFromManaCost(dc.cards?.mana_cost)
      const colorKey = ColorIdentity.normalize(colors)
      acc[colorKey] = (acc[colorKey] || 0) + dc.quantity
      return acc
    },
    {} as Record<string, number>
  )

  const totalSymbols = Object.values(colorCounts).reduce((a, b) => a + b, 0)
  const totalCards = filteredCards.reduce((sum, dc) => sum + dc.quantity, 0)

  if (totalSymbols === 0) {
    return <div className="text-center py-8 text-muted-foreground">No color data available</div>
  }

  const sortedColors = Object.entries(colorCounts).sort(
    ([a], [b]) => ColorIdentity.ORDER.indexOf(a) - ColorIdentity.ORDER.indexOf(b)
  )

  const sortedCombos = Object.entries(colorCombos).sort(([a], [b]) => ColorIdentity.compare(a, b))

  return (
    <div className="space-y-4">
      {/* Stacked Bar Chart - Symbol Distribution */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Mana Symbols</span>
          <span className="font-medium">{totalSymbols}</span>
        </div>

        <div className="relative h-12 bg-accent/30 rounded-lg overflow-hidden border border-border">
          <div className="flex h-full">
            {sortedColors.map(([colorLetter, count]) => {
              const percentage = (count / totalSymbols) * 100
              const isHovered = hoveredColor === colorLetter
              const colorInfo = ColorIdentity.getColorInfo(colorLetter)

              return (
                <div
                  key={colorLetter}
                  className="relative transition-all duration-200 ease-out cursor-pointer"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: colorInfo.color,
                    opacity: hoveredColor && !isHovered ? 0.4 : 1,
                    transform: isHovered ? 'scaleY(1.1)' : 'scaleY(1)',
                  }}
                  onMouseEnter={() => setHoveredColor(colorLetter)}
                  onMouseLeave={() => setHoveredColor(null)}
                >
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div className="absolute left-1/2 -translate-x-1/2 -top-14 bg-popover text-popover-foreground px-3 py-2 rounded-md text-sm font-medium shadow-lg border whitespace-nowrap z-10">
                      <div className="flex items-center gap-2">
                        <i className={colorInfo.className} />
                        <span>
                          : {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-popover" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Color Combinations Breakdown */}
      <div className="space-y-3 pt-2 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Cards by Color</span>
          <span className="font-medium">{totalCards}</span>
        </div>

        <div className="space-y-1.5">
          {sortedCombos.map(([combo, count]) => {
            const percentage = ((count / totalCards) * 100).toFixed(1)
            const isHovered = hoveredCombo === combo

            return (
              <div
                key={combo}
                className="relative group"
                onMouseEnter={() => setHoveredCombo(combo)}
                onMouseLeave={() => setHoveredCombo(null)}
              >
                <div
                  className={cn(
                    'flex items-center justify-between p-2 rounded-lg border cursor-pointer',
                    'transition-all duration-150 ease-out',
                    isHovered
                      ? 'bg-accent border-border shadow-md'
                      : 'bg-card border-border/50 hover:bg-accent/50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <i className={ColorIdentity.getClassName(combo)} />
                    <span className="font-large">{ColorIdentity.getLabel(combo)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold tabular-nums text-sm">{count}</span>
                    <span className="text-xs text-muted-foreground tabular-nums min-w-[3rem] text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
