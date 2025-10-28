'use client'

import { useLatestDeck } from '@/lib/api/stats'
import { DeckCard } from '@/components/decks/DeckCard'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Loader2 } from 'lucide-react'

export function FeaturedDeckCard() {
  const { data: featuredDeck, isLoading, error } = useLatestDeck()

  if (isLoading) {
    return (
      <Card className="glass border-white/10 bg-card-tinted">
        <CardContent className="p-12 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin" style={{ color: 'var(--mana-color)' }} />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="glass border-white/10 bg-card-tinted">
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">
            Unable to load featured deck. Please try again later.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!featuredDeck) {
    return (
      <Card className="glass border-white/10 bg-card-tinted">
        <CardContent className="p-12 text-center">
          <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">No featured deck available at this time.</p>
        </CardContent>
      </Card>
    )
  }

  return <DeckCard deck={featuredDeck} variant="featured" />
}
