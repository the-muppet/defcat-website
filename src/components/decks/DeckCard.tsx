// components/deck/DeckCard.tsx
"use client"

import { memo } from "react"
import type { Database } from "@/types/supabase"
import { ManaSymbols } from "@/components/decks/ManaSymbols"
import { CommanderImage } from "@/components/decks/Commander"
import { ExternalLink, Eye, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

type Deck = Database['public']['Tables']['decks']['Row']

interface DeckCardProps {
  deck: Deck
  className?: string
  variant?: 'default' | 'compact' | 'featured'
}

export const DeckCard = memo(function DeckCard({ 
  deck, 
  className,
  variant = 'default'
}: DeckCardProps) {
  const formattedDate = new Date(deck?.updated_at || Date.now()).toISOString().split("T")[0]
  
  if (variant === 'compact') {
    return (
      <div className={cn(
        "group card-tinted-glass hover-tinted rounded-xl p-4 transition-all duration-300",
        "hover:shadow-tinted-glow hover:scale-[1.01]",
        className
      )}>
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-tinted transition-colors">
            {deck.name}
          </h3>
          {deck.format && (
            <span className="badge-tinted-primary text-xs px-2 py-1 rounded-full">
              {deck.format}
            </span>
          )}
        </div>
        
        {deck.commanders && deck.commanders.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            {deck.color_identity && (
              <ManaSymbols 
                mana={deck.color_identity} 
                size="sm"
                shadow
                className="opacity-80 group-hover:opacity-100 transition-opacity"
              />
            )}
            <span className="text-sm text-muted-foreground line-clamp-1">
              {deck.commanders.join(' & ')}
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex gap-3">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {deck.view_count?.toLocaleString() || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {deck.like_count?.toLocaleString() || 0}
            </span>
          </div>
          <span>{formattedDate}</span>
        </div>
      </div>
    )
  }
  
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-2xl",
      "card-tinted-glass shadow-tinted-lg",
      "p-6 transition-all duration-300",
      "hover:scale-[1.02] hover:shadow-tinted-xl",
      variant === 'featured' && "shimmer-tinted",
      className
    )}>
      <div className="relative flex gap-6">
        {/* Commander Image with Scryfall Art */}
        <div className="flex-shrink-0">
          <div className={cn(
            "relative h-80 w-56 overflow-hidden rounded-xl",
            "border-2 border-tinted shadow-tinted-lg",
            "group-hover:shadow-tinted-glow transition-all duration-300"
          )}>
            <CommanderImage 
              commanders={deck.commanders || []}
              className="h-full w-full"
            />
            
            {/* Color Identity Indicators */}
            {deck.color_identity && deck.color_identity.length > 0 && (
              <div className="absolute left-2 top-2 drop-shadow-lg">
                <ManaSymbols 
                  mana={deck.color_identity} 
                  size="2x"
                  shadow
                />
              </div>
            )}

            {/* Commander Name Overlay - using glass-tinted */}
            {deck.commanders && deck.commanders.length > 0 && (
              <div className="absolute inset-x-0 bottom-0 p-3 glass-tinted-strong">
                <div className="text-xs font-medium text-white line-clamp-2">
                  {deck.commanders.join(' & ')}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Deck Information */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <div className="mb-4">
            <div className="mb-2 flex items-start justify-between gap-4">
              <h2 className="text-3xl font-bold gradient-tinted-text">
                {deck.name}
              </h2>
              {deck.format && (
                <span className="badge-tinted-primary px-4 py-1 rounded-full text-sm font-semibold uppercase tracking-wider">
                  {deck.format}
                </span>
              )}
            </div>

            {/* Commanders */}
            {deck.commanders && deck.commanders.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {deck.commanders.map((commander, idx) => (
                  <span
                    key={idx}
                    className="badge-tinted px-3 py-1 rounded-lg text-sm"
                  >
                    {commander}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 hover-tinted px-2 py-1 rounded-md">
                <Eye className="h-4 w-4" />
                <span>{deck.view_count?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 hover-tinted px-2 py-1 rounded-md">
                <Heart className="h-4 w-4" />
                <span>{deck.like_count?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {deck.description && (
            <div className="mb-4 flex-1">
              <p className="line-clamp-6 text-sm leading-relaxed text-muted-foreground">
                {deck.description}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-tinted pt-4">
            <span className="text-sm text-muted-foreground">{formattedDate}</span>
            {deck.moxfield_url && (
              <a href={deck.moxfield_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group/link flex items-center gap-2 rounded-lg px-4 py-2",
                  "btn-tinted text-sm font-medium",
                  "transition-all duration-300"
                )}
              >
                View on Moxfield
                <ExternalLink className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
              </a>
            )}
          </div>
        </div>
      </div>
      
      {/* Optional featured indicator */}
      {variant === 'featured' && (
        <div className="absolute top-4 right-4">
          <span className="badge-tinted-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider pulse-tinted">
            Featured
          </span>
        </div>
      )}
    </div>
  )
})