/**
 * Individual Deck Detail Page
 */
/** biome-ignore-all lint/performance/noImgElement: <explanation> */
/** biome-ignore-all lint/a11y/useButtonType: <explanation> */

'use client'

import {
  ArrowLeft,
  BarChart3,
  Calendar,
  ChartNoAxesColumn,
  Check,
  Copy,
  ExternalLink,
  Eye,
  Grid3x3,
  Heart,
  List,
  Share2,
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { use, useEffect, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { CardPreview, ColorDistribution, ManaCurve, TypeDistribution } from '@/components/decks'
import { RoastButton } from '@/components/decks/RoastButton'
import { Button } from '@/components/ui/button'
import { GlowingEffect } from '@/components/ui/glowEffect'
import { useDeck } from '@/lib/hooks/useDecks'

interface PageProps {
  params: Promise<{ id: string }>
}

function CardTypeSection({ type, typeCards }: { type: string; typeCards: any[] }) {
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
          <CardPreview key={`${dc.cards?.name || 'unknown'}-${idx}`} card={dc.cards} quantity={dc.quantity} />
        ))}
      </div>
    </div>
  )
}

export default function DeckDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const { data: deck, cards: deckCards, isLoading, error } = useDeck(id)
  const [activeTab, setActiveTab] = useState<'list' | 'visual' | 'stats'>('list')
  const [copied, setCopied] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(false)
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set())
  const [columns, setColumns] = useState(4) // Number of columns in visual grid
  const listContainerRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }

    checkDarkMode()

    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  // Responsive column detection for visual grid
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width < 640) setColumns(2) // mobile
      else if (width < 768) setColumns(3) // tablet
      else setColumns(4) // desktop
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  // Prepare cards for visual grid virtualization (must be called before early returns)
  const cards = deckCards || []
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

  // Group cards into rows for virtualization
  const cardRows: typeof visualCards[] = []
  for (let i = 0; i < visualCards.length; i += columns) {
    cardRows.push(visualCards.slice(i, i + columns))
  }

  // Virtual grid setup (always called to maintain hook order)
  const rowVirtualizer = useVirtualizer({
    count: cardRows.length,
    getScrollElement: () => visualGridRef.current,
    estimateSize: () => 400,
    overscan: 2,
  })

  const moxfieldIcon = isDark
    ? 'https://assets.moxfield.net/assets/images/logo-text.svg'
    : 'https://assets.moxfield.net/assets/images/logo-text-color.svg'

  const toggleTypeFilter = (type: string) => {
    setSelectedType(selectedType === type ? null : type)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-4" />
            <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 border-4 border-primary/10 mx-auto" />
          </div>
          <p className="text-muted-foreground font-medium">Loading deck...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5">
        <div className="text-center max-w-md">
          <div className="bg-destructive/10 rounded-full p-4 inline-block mb-4">
            <div className="text-destructive text-4xl">⚠</div>
          </div>
          <p className="text-destructive text-lg font-semibold mb-2">
            {error?.message || 'Failed to load deck'}
          </p>
          <p className="text-muted-foreground mb-6">
            Something went wrong while loading this deck.
          </p>
          <Button asChild size="lg" className="shadow-lg">
            <Link href="/decks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Decks
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!deck) {
    notFound()
  }

  const mainboardCards = cards.filter((dc) => dc.board === 'mainboard')
  const commanderCards = cards.filter((dc) => dc.board === 'commanders')

  const getCardImageUrl = (card: any, artCrop = false) => {
    if (!artCrop && card?.cached_image_url) return card.cached_image_url
    if (card?.scryfall_id) {
      const imageType = artCrop ? 'art_crop/front' : 'normal/front'
      return `https://cards.scryfall.io/${imageType}/${card.scryfall_id[0]}/${card.scryfall_id[1]}/${card.scryfall_id}.jpg`
    }
    return null
  }

  const commanderImageUrls = commanderCards
    .map((cmd) => getCardImageUrl(cmd.cards, true))
    .filter(Boolean) as string[]

  const totalCards = cards.reduce((sum, dc) => sum + dc.quantity, 0)
  const uniqueCards = cards.length
  const avgCMC =
    mainboardCards.length > 0
      ? (
          mainboardCards.reduce((sum, dc) => sum + (dc.cards?.cmc || 0) * dc.quantity, 0) /
          totalCards
        ).toFixed(2)
      : '0'

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
            {deck.moxfield_url && <RoastButton moxfieldUrl={deck.moxfield_url} variant="default" />}
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
            {/* Hero Card */}
            <div className="relative rounded-2xl border-3 md:rounded-2xl">
              <GlowingEffect
                blur={0}
                borderWidth={3}
                spread={80}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
              />
              <div className="bg-card border-0 rounded-2xl overflow-hidden shadow-xl relative">
                {/* Gradient Header */}
                <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 border-b border-border overflow-hidden">
                  {commanderImageUrls.length > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {commanderImageUrls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Commander ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      ))}
                    </div>
                  )}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                  <div className="relative">
                    {/* Color Identity Badge */}
                    {deck.color_identity && deck.color_identity.length > 0 && (
                      <div className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 mb-4 border border-white/20 shadow-lg">
                        {(deck.color_identity || []).map((color, idx) => (
                          <i key={idx} className={`ms ms-${color.toLowerCase()} ms-2x`} />
                        ))}
                      </div>
                    )}

                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight drop-shadow-lg">
                      {deck.name}
                    </h1>

                    {/* Commanders */}
                    <div className="flex flex-wrap gap-2">
                      {deck.commanders?.map((cmd, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-4 py-2 rounded-full bg-black/40 text-white border border-white/30 font-semibold text-sm hover:bg-black/50 transition-all shadow-lg backdrop-blur-sm"
                        >
                          {cmd}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {deck.description && (
                  <div className="p-8 border-b border-border bg-accent/20">
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {deck.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Decklist Section with Tabs */}
            <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3">
              <GlowingEffect
                blur={0}
                borderWidth={3}
                spread={80}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
              />
              <div className="bg-card border-0 rounded-2xl shadow-xl overflow-hidden relative">
                {/* Tab Navigation */}
                <div className="border-b border-border bg-accent/30">
                  <div className="flex items-center justify-between px-6">
                    <div className="flex items-center">
                      <button
                        onClick={() => setActiveTab('list')}
                        className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all relative ${
                          activeTab === 'list'
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <List className="h-4 w-4" />
                        List View
                        {activeTab === 'list' && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab('visual')}
                        className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all relative ${
                          activeTab === 'visual'
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Grid3x3 className="h-4 w-4" />
                        Visual
                        {activeTab === 'visual' && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab('stats')}
                        className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all relative ${
                          activeTab === 'stats'
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <BarChart3 className="h-4 w-4" />
                        Statistics
                        {activeTab === 'stats' && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {deck.moxfield_url && (
                        <a
                          href={deck.moxfield_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:scale-105 transition-transform"
                          title="View on Moxfield"
                        >
                          <img
                            src={moxfieldIcon}
                            alt="Moxfield"
                            width={100}
                            height={100}
                            className="rounded"
                          />
                        </a>
                      )}
                      <Button size="sm" variant="outline">
                        <Copy className="h-3 w-3 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {isLoading ? (
                    <div className="text-center py-16">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">Loading cards...</p>
                    </div>
                  ) : activeTab === 'list' && cards.length > 0 ? (
                    <>
                      {/* Quick Navigation Header - Filter Bar */}
                      <div className="mb-6 pb-4 border-b border-border">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Filter by Type:
                          </span>
                          {selectedType && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>
                                Showing{' '}
                                {cards
                                  .filter((dc) => dc.cards?.type_line?.includes(selectedType))
                                  .reduce((sum, dc) => sum + dc.quantity, 0)}{' '}
                                of {cards.reduce((sum, dc) => sum + dc.quantity, 0)} cards
                              </span>
                              <button
                                onClick={() => setSelectedType(null)}
                                className="text-primary hover:text-primary/80 underline font-semibold"
                              >
                                Clear filter
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {[
                            { type: 'Creature', icon: 'ms-creature', color: 'text-green-500', glowColor: 'rgba(34, 197, 94, 0.3)', bgGlow: 'bg-green-500/10' },
                            { type: 'Instant', icon: 'ms-instant', color: 'text-blue-500', glowColor: 'rgba(59, 130, 246, 0.3)', bgGlow: 'bg-blue-500/10' },
                            { type: 'Sorcery', icon: 'ms-sorcery', color: 'text-red-500', glowColor: 'rgba(239, 68, 68, 0.3)', bgGlow: 'bg-red-500/10' },
                            { type: 'Artifact', icon: 'ms-artifact', color: 'text-gray-500', glowColor: 'rgba(107, 114, 128, 0.3)', bgGlow: 'bg-gray-500/10' },
                            { type: 'Enchantment', icon: 'ms-enchantment', color: 'text-purple-500', glowColor: 'rgba(168, 85, 247, 0.3)', bgGlow: 'bg-purple-500/10' },
                            { type: 'Planeswalker', icon: 'ms-planeswalker', color: 'text-indigo-500', glowColor: 'rgba(99, 102, 241, 0.3)', bgGlow: 'bg-indigo-500/10' },
                            { type: 'Battle', icon: 'ms-battle', color: 'text-orange-500', glowColor: 'rgba(249, 115, 22, 0.3)', bgGlow: 'bg-orange-500/10' },
                            { type: 'Tribal', icon: 'ms-tribal', color: 'text-pink-500', glowColor: 'rgba(236, 72, 153, 0.3)', bgGlow: 'bg-pink-500/10' },
                            { type: 'Land', icon: 'ms-land', color: 'text-amber-500', glowColor: 'rgba(245, 158, 11, 0.3)', bgGlow: 'bg-amber-500/10' },
                          ].map(({ type, icon, color, glowColor, bgGlow }) => {
                            const typeCards = cards.filter((dc) =>
                              dc.cards?.type_line?.includes(type)
                            )
                            if (typeCards.length === 0) return null
                            const count = typeCards.reduce((sum, dc) => sum + dc.quantity, 0)
                            const isActive = selectedType === type

                            return (
                              <button
                                key={type}
                                onClick={() => toggleTypeFilter(type)}
                                title={`${type}s (${count})`}
                                className={`group relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg border transition-all min-w-[80px] min-h-[50px] ${
                                  isActive
                                    ? `${bgGlow} border-current scale-105`
                                    : 'bg-accent/50 hover:bg-primary/20 border-border hover:border-primary hover:shadow-md'
                                }`}
                                style={isActive ? {
                                  boxShadow: `inset 0 0 30px ${glowColor}, inset 0 0 15px ${glowColor}`,
                                  background: `radial-gradient(circle at 50% 50%, ${glowColor.replace('0.3', '0.2')}, transparent 75%)`
                                } : {}}
                              >
                                <i
                                  className={`ms ${icon} ${color}`}
                                  style={{ fontSize: '24px', filter: isActive ? 'drop-shadow(0 0 8px currentColor)' : 'none' }}
                                />
                                <span
                                  className={`text-[10px] font-bold ${
                                    isActive
                                      ? 'text-foreground'
                                      : 'text-muted-foreground group-hover:text-primary'
                                  }`}
                                >
                                  {type}s
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Card Type Sections - Filtered */}
                      <div className="space-y-8 max-h-[400px] sm:max-h-[500px] md:max-h-[600px] lg:max-h-[700px] overflow-y-auto">
                        {[
                          'Creature',
                          'Instant',
                          'Sorcery',
                          'Artifact',
                          'Enchantment',
                          'Planeswalker',
                          'Battle',
                          'Tribal',
                          'Land',
                        ].map((type) => {
                          const typeCards = cards.filter((dc) =>
                            dc.cards?.type_line?.includes(type)
                          )
                          if (typeCards.length === 0) return null

                          // Hide section if a different type is selected
                          if (selectedType && selectedType !== type) return null

                          return (
                            <CardTypeSection
                              key={type}
                              type={type}
                              typeCards={typeCards}
                            />
                          )
                        })}
                      </div>
                    </>
                  ) : activeTab === 'visual' && cards.length > 0 ? (
                    <>
                      {/* Quick Navigation Header - Filter Bar */}
                      <div className="mb-6 pb-4 border-b border-border">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Filter by Type:
                          </span>
                          {selectedType && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>
                                Showing{' '}
                                {cards
                                  .filter((dc) => dc.cards?.type_line?.includes(selectedType))
                                  .reduce((sum, dc) => sum + dc.quantity, 0)}{' '}
                                of {cards.reduce((sum, dc) => sum + dc.quantity, 0)} cards
                              </span>
                              <button
                                onClick={() => setSelectedType(null)}
                                className="text-primary hover:text-primary/80 underline font-semibold"
                              >
                                Clear filter
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {[
                            { type: 'Creature', icon: 'ms-creature', color: 'text-green-500', glowColor: 'rgba(34, 197, 94, 0.3)', bgGlow: 'bg-green-500/10' },
                            { type: 'Instant', icon: 'ms-instant', color: 'text-blue-500', glowColor: 'rgba(59, 130, 246, 0.3)', bgGlow: 'bg-blue-500/10' },
                            { type: 'Sorcery', icon: 'ms-sorcery', color: 'text-red-500', glowColor: 'rgba(239, 68, 68, 0.3)', bgGlow: 'bg-red-500/10' },
                            { type: 'Artifact', icon: 'ms-artifact', color: 'text-gray-500', glowColor: 'rgba(107, 114, 128, 0.3)', bgGlow: 'bg-gray-500/10' },
                            { type: 'Enchantment', icon: 'ms-enchantment', color: 'text-purple-500', glowColor: 'rgba(168, 85, 247, 0.3)', bgGlow: 'bg-purple-500/10' },
                            { type: 'Planeswalker', icon: 'ms-planeswalker', color: 'text-indigo-500', glowColor: 'rgba(99, 102, 241, 0.3)', bgGlow: 'bg-indigo-500/10' },
                            { type: 'Battle', icon: 'ms-battle', color: 'text-orange-500', glowColor: 'rgba(249, 115, 22, 0.3)', bgGlow: 'bg-orange-500/10' },
                            { type: 'Tribal', icon: 'ms-tribal', color: 'text-pink-500', glowColor: 'rgba(236, 72, 153, 0.3)', bgGlow: 'bg-pink-500/10' },
                            { type: 'Land', icon: 'ms-land', color: 'text-amber-500', glowColor: 'rgba(245, 158, 11, 0.3)', bgGlow: 'bg-amber-500/10' },
                          ].map(({ type, icon, color, glowColor, bgGlow }) => {
                            const typeCards = cards.filter((dc) =>
                              dc.cards?.type_line?.includes(type)
                            )
                            if (typeCards.length === 0) return null
                            const count = typeCards.reduce((sum, dc) => sum + dc.quantity, 0)
                            const isActive = selectedType === type

                            return (
                              <button
                                key={type}
                                onClick={() => toggleTypeFilter(type)}
                                title={`${type}s (${count})`}
                                className={`group relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg border transition-all min-w-[80px] min-h-[50px] ${
                                  isActive
                                    ? `${bgGlow} border-current scale-105`
                                    : 'bg-accent/50 hover:bg-primary/20 border-border hover:border-primary hover:shadow-md'
                                }`}
                                style={isActive ? {
                                  boxShadow: `inset 0 0 30px ${glowColor}, inset 0 0 15px ${glowColor}`,
                                  background: `radial-gradient(circle at 50% 50%, ${glowColor.replace('0.3', '0.2')}, transparent 75%)`
                                } : {}}
                              >
                                <i
                                  className={`ms ${icon} ${color}`}
                                  style={{ fontSize: '24px', filter: isActive ? 'drop-shadow(0 0 8px currentColor)' : 'none' }}
                                />
                                <span
                                  className={`text-[10px] font-bold ${
                                    isActive
                                      ? 'text-foreground'
                                      : 'text-muted-foreground group-hover:text-primary'
                                  }`}
                                >
                                  {type}s
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Virtualized Grid Container */}
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
                              const [frontType, backType] = typeLine.split('//').map(t => t.trim())
                              // If filtering by a type that's on the back face but not the front, auto-flip
                              if (backType.includes(selectedType) && !frontType.includes(selectedType)) {
                                autoFlip = true
                              }
                            }

                            // Manual flip state overrides auto-flip
                            const manuallyFlipped = flippedCards.has(cardName)
                            const isFlipped = autoFlip ? !manuallyFlipped : manuallyFlipped

                            // Image URLs for both faces
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
                                    {/* Quantity Badge - Front */}
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
                                      {/* Quantity Badge - Back */}
                                      {dc.quantity > 1 && (
                                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground font-bold text-sm rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                                          {dc.quantity}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* DFC Flip Button - Outside the rotating container */}
                                {isDFC && (
                                  <button
                                    onClick={() => toggleCardFlip(cardName)}
                                    className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center shadow-lg hover:bg-black/90 transition-colors cursor-pointer z-20"
                                    title={isFlipped ? 'Show front face' : 'Show back face'}
                                  >
                                    <i className="ms ms-ability-duels-dfc text-white" style={{ fontSize: '16px' }} />
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
                  ) : activeTab === 'stats' && cards.length > 0 ? (
                    <>
                      {/* Quick Navigation Header - Filter Bar */}
                      <div className="mb-6 pb-4 border-b border-border">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Filter by Type:
                          </span>
                          {selectedType && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>
                                Showing{' '}
                                {cards
                                  .filter((dc) => dc.cards?.type_line?.includes(selectedType))
                                  .reduce((sum, dc) => sum + dc.quantity, 0)}{' '}
                                of {cards.reduce((sum, dc) => sum + dc.quantity, 0)} cards
                              </span>
                              <button
                                onClick={() => setSelectedType(null)}
                                className="text-primary hover:text-primary/80 underline font-semibold"
                              >
                                Clear filter
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {[
                            { type: 'Creature', icon: 'ms-creature', color: 'text-green-500', glowColor: 'rgba(34, 197, 94, 0.3)', bgGlow: 'bg-green-500/10' },
                            { type: 'Instant', icon: 'ms-instant', color: 'text-blue-500', glowColor: 'rgba(59, 130, 246, 0.3)', bgGlow: 'bg-blue-500/10' },
                            { type: 'Sorcery', icon: 'ms-sorcery', color: 'text-red-500', glowColor: 'rgba(239, 68, 68, 0.3)', bgGlow: 'bg-red-500/10' },
                            { type: 'Artifact', icon: 'ms-artifact', color: 'text-gray-500', glowColor: 'rgba(107, 114, 128, 0.3)', bgGlow: 'bg-gray-500/10' },
                            { type: 'Enchantment', icon: 'ms-enchantment', color: 'text-purple-500', glowColor: 'rgba(168, 85, 247, 0.3)', bgGlow: 'bg-purple-500/10' },
                            { type: 'Planeswalker', icon: 'ms-planeswalker', color: 'text-indigo-500', glowColor: 'rgba(99, 102, 241, 0.3)', bgGlow: 'bg-indigo-500/10' },
                            { type: 'Battle', icon: 'ms-battle', color: 'text-orange-500', glowColor: 'rgba(249, 115, 22, 0.3)', bgGlow: 'bg-orange-500/10' },
                            { type: 'Tribal', icon: 'ms-tribal', color: 'text-pink-500', glowColor: 'rgba(236, 72, 153, 0.3)', bgGlow: 'bg-pink-500/10' },
                            { type: 'Land', icon: 'ms-land', color: 'text-amber-500', glowColor: 'rgba(245, 158, 11, 0.3)', bgGlow: 'bg-amber-500/10' },
                          ].map(({ type, icon, color, glowColor, bgGlow }) => {
                            const typeCards = cards.filter((dc) =>
                              dc.cards?.type_line?.includes(type)
                            )
                            if (typeCards.length === 0) return null
                            const count = typeCards.reduce((sum, dc) => sum + dc.quantity, 0)
                            const isActive = selectedType === type

                            return (
                              <button
                                key={type}
                                onClick={() => toggleTypeFilter(type)}
                                title={`${type}s (${count})`}
                                className={`group relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg border transition-all min-w-[80px] min-h-[50px] ${
                                  isActive
                                    ? `${bgGlow} border-current scale-105`
                                    : 'bg-accent/50 hover:bg-primary/20 border-border hover:border-primary hover:shadow-md'
                                }`}
                                style={isActive ? {
                                  boxShadow: `inset 0 0 30px ${glowColor}, inset 0 0 15px ${glowColor}`,
                                  background: `radial-gradient(circle at 50% 50%, ${glowColor.replace('0.3', '0.2')}, transparent 75%)`
                                } : {}}
                              >
                                <i
                                  className={`ms ${icon} ${color}`}
                                  style={{ fontSize: '24px', filter: isActive ? 'drop-shadow(0 0 8px currentColor)' : 'none' }}
                                />
                                <span
                                  className={`text-[10px] font-bold ${
                                    isActive
                                      ? 'text-foreground'
                                      : 'text-muted-foreground group-hover:text-primary'
                                  }`}
                                >
                                  {type}s
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div className="space-y-8">
                        {/* Mana Curve */}
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-4">Mana Curve</h3>
                          <ManaCurve
                            cards={mainboardCards.filter(
                              (dc) => !selectedType || dc.cards?.type_line?.includes(selectedType)
                            )}
                          />
                        </div>

                        {/* Type Distribution */}
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-4">
                            Type Distribution
                          </h3>
                          <TypeDistribution
                            deckCards={mainboardCards.filter(
                              (dc) => !selectedType || dc.cards?.type_line?.includes(selectedType)
                            )}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-16 text-center">
                      <div className="mb-4">
                        <ExternalLink className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      </div>
                      <p className="text-lg font-semibold text-foreground mb-2">
                        Decklist Not Available
                      </p>
                      <p className="text-muted-foreground mb-6">
                        The full card list hasn't been loaded yet.
                      </p>
                      {deck.moxfield_url && (
                        <Button asChild size="lg">
                          <a
                            href={deck.moxfield_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <img
                              src={moxfieldIcon}
                              alt="Moxfield"
                              width={20}
                              height={20}
                              className="rounded"
                            />
                            View on Moxfield
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Side (1/3) */}
          <div className="space-y-6">
            {/* Stats & Engagement Card */}
            <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3">
              <GlowingEffect
                blur={0}
                borderWidth={3}
                spread={80}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
              />
              <div className="bg-card border-0 rounded-2xl p-5 shadow-xl relative">
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-tinted" />
                  Deck Stats
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  {/* Left Column - Quick Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 rounded-full p-1.5">
                          <BarChart3 className="h-4 w-4 text-amber-500" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Total Cards</div>
                          <div className="text-xl font-bold text-foreground">{totalCards}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="bg-cyan-500/10 rounded-full p-1.5">
                          <Grid3x3 className="h-4 w-4 text-cyan-500" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Unique Cards</div>
                          <div className="text-xl font-bold text-foreground">{uniqueCards}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="bg-purple-500/10 rounded-full p-1.5">
                          <ChartNoAxesColumn className="h-4 w-4 text-pink-500" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Avg. CMC</div>
                          <div className="text-xl font-bold text-foreground">{avgCMC}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Engagement */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="bg-teal-500/10 rounded-full p-1.5">
                          <Eye className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Views</div>
                          <div className="text-xl font-bold text-foreground">
                            {deck.view_count?.toLocaleString() || 0}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="bg-red-500/10 rounded-full p-1.5">
                          <Heart className="h-4 w-4 text-red-500" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Likes</div>
                          <div className="text-xl font-bold text-foreground">
                            {deck.like_count?.toLocaleString() || 0}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-500/10 rounded-full p-1.5">
                          <Calendar className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Updated</div>
                          <div className="text-xl font-bold text-foreground">
                            {deck.updated_at ? new Date(deck.updated_at).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Distribution Card */}
            {!isLoading && cards.length > 0 && (
              <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3">
                <GlowingEffect
                  blur={0}
                  borderWidth={3}
                  spread={80}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                />
                <div className="bg-card border-0 rounded-2xl p-5 shadow-xl relative">
                  <h2 className="text-lg font-bold text-foreground mb-3">Color Distribution</h2>
                  <ColorDistribution cards={cards} selectedType={selectedType} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
