// components/decks/detail/DeckDetailLayout.tsx
'use client'

import { useState } from 'react'
import { ArrowLeft, Check, Share2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RoastButton } from '@/components/decks/RoastButton'
import { DeckHeader } from './DeckHeader'
import { DeckTabs } from './DeckTabs'
import { DeckSidebar } from './DeckSidebar'
import type { DeckWithCards, Deck } from '@/types/supabase'

interface DeckDetailLayoutProps {
  deck: Deck
  cards: DeckWithCards[]
}

export function DeckDetailLayout({ deck, cards }: DeckDetailLayoutProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-6 max-w-[1600px]">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-6">
          <Button asChild variant="ghost" className="hover:bg-accent">
            <Link href="/decks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Decks
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            {deck.public_url && <RoastButton moxfieldUrl={deck.public_url} variant="default" />}
            <Button variant="outline" onClick={handleShare} className="gap-2">
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <DeckHeader deck={deck} cards={cards} />
            <DeckTabs deck={deck} cards={cards} />
          </div>

          {/* Sidebar - Right Side (1/3) */}
          <DeckSidebar deck={deck} cards={cards} />
        </div>
      </div>
    </div>
  )
}