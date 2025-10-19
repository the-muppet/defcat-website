// components/settings/ManaSymbolSelector.tsx
"use client"

import { useEffect } from 'react'
import { ManaSymbol } from '@/lib/utility/svg-mask'
import { MANA_SVG_MAP, preloadManaSVGs } from '@/lib/utility/mana-svg-loader';
import { useManaColor } from '@/lib/contexts/ManaColorContext'
import { ManaSymbolIcon } from './ManaSymbolIcon'
import { cn } from '@/lib/utils'


export const manaSymbols = Object.values(ManaSymbol).map(symbol => MANA_SVG_MAP[symbol])

export function ManaSymbolSelector() {
  const { selectedMana, setSelectedMana } = useManaColor()

  // Preload SVGs on mount
  useEffect(() => {
    const cleanup = preloadManaSVGs()
    return cleanup
  }, [])

  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-3">Mana Symbol</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Choose your mana color for theme animations and accent colors
        </p>
      </div>
      
      <div className="grid grid-cols-5 gap-3">
        {manaSymbols.map((mana) => {
          const isSelected = selectedMana === mana.symbol
          
          return (
            <button
              key={mana.symbol}
              onClick={() => setSelectedMana(mana.symbol)}
              className={cn(
                "relative aspect-square rounded-xl border-2 transition-all duration-300",
                "hover:scale-105 active:scale-95",
                "flex items-center justify-center p-2",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isSelected
                  ? "scale-105 shadow-lg"
                  : "border-border hover:shadow-md"
              )}
              style={{
                color: isSelected ? mana.cssColor : 'var(--muted-foreground)',
                borderColor: isSelected ? mana.cssColor : undefined,
                ...(isSelected && {
                  boxShadow: `0 0 0 4px var(--background), 0 0 0 6px ${mana.cssColor}`
                })
              }}
              aria-label={`Select ${mana.label} mana`}
              aria-pressed={isSelected}
            >
              <ManaSymbolIcon
                symbol={mana.symbol}
                size="lg"
                fillColor={isSelected ? mana.cssColor : undefined}
                className={cn(
                  "transition-all duration-300",
                  isSelected
                    ? "opacity-100 scale-100"
                    : "opacity-40 hover:opacity-70 scale-90 hover:scale-95"
                )}
                style={{
                  filter: isSelected ? 'brightness(1.3) saturate(1.5)' : undefined
                }}
              />
              
              {/* Checkmark for selected */}
              {isSelected && (
                <div 
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 animate-in zoom-in"
                  style={{ 
                    backgroundColor: mana.cssColor,
                  }}
                >
                  <svg 
                    className="w-3.5 h-3.5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </div>
              )}

              {/* Subtle glow on hover */}
              <div 
                className={cn(
                  "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300",
                  "pointer-events-none",
                  !isSelected && "hover:opacity-20"
                )}
                style={{
                  background: `radial-gradient(circle at center, ${mana.cssColor}, transparent 70%)`
                }}
              />
            </button>
          )
        })}
      </div>
      
      <div className="flex items-center justify-center gap-2 text-xs">
        <span className="text-muted-foreground">Selected:</span>
        <span 
          className="font-medium transition-colors duration-300"
          style={{ color: MANA_SVG_MAP[selectedMana].cssColor }}
        >
          {MANA_SVG_MAP[selectedMana].label}
        </span>
      </div>
    </div>
  )
}