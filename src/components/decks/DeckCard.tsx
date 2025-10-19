// components/deck/DeckCard.tsx
"use client"

import { memo } from "react"
import type { Database } from "@/types/supabase"
import { ShineBorder } from "@/components/magicui/shine-border"
import { ManaSymbols } from "@/components/decks/ManaSymbols"
import { CommanderImage } from "@/components/decks/Commander"
import { ExternalLink, Eye, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

type Deck = Database['public']['Tables']['decks']['Row']

interface DeckCardProps {
  deck: Deck
  className?: string
}

export const DeckCard = memo(function DeckCard({ deck, className }: DeckCardProps) {
  const formattedDate = new Date(deck?.updated_at || Date.now()).toISOString().split("T")[0]
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-2xl border border-white/10",
      "bg-gradient-to-br from-slate-900/90 to-slate-800/90",
      "p-6 backdrop-blur-sm transition-all duration-300",
      "hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20",
      className
    )}>
      <ShineBorder
        borderWidth={2} 
        duration={140} 
        shineColor={'linearGradient: blue-to-red'}
      />
      
      <div className="relative flex gap-6">
        {/* Commander Image with Scryfall Art */}
        <div className="flex-shrink-0">
          <div className="relative h-80 w-56 overflow-hidden rounded-xl border-2 border-white/20 shadow-2xl">
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

            {/* Commander Name Overlay */}
            {deck.commanders && deck.commanders.length > 0 && (
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                <div className="text-xs font-medium text-white/90 line-clamp-2">
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
              <h2 className="text-3xl font-bold text-white">{deck.name}</h2>
              {deck.format && (
                <span className="flex-shrink-0 rounded-full bg-purple-500/20 px-4 py-1 text-sm font-semibold uppercase tracking-wider text-purple-300 ring-1 ring-purple-400/50">
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
                    className="rounded-lg bg-white/5 px-3 py-1 text-sm text-gray-300 backdrop-blur-sm ring-1 ring-white/10"
                  >
                    {commander}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{deck.view_count?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="h-4 w-4" />
                <span>{deck.like_count?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {deck.description && (
            <div className="mb-4 flex-1">
              <p className="line-clamp-6 text-sm leading-relaxed text-gray-300">
                {deck.description}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-sm text-gray-500">{formattedDate}</span>
            {deck.moxfield_url && (
              
               <a href={deck.moxfield_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link flex items-center gap-2 rounded-lg bg-purple-600/20 px-4 py-2 text-sm font-medium text-purple-300 transition-all hover:bg-purple-600/30 hover:text-purple-200"
              >
                View on Moxfield
                <ExternalLink className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})