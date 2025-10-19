// app/page.tsx
"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Search, TrendingUp, Sparkles, BarChart3, Crown, Award, Loader2 } from "lucide-react"
import { ManaSymbols } from "@/components/decks/ManaSymbols"
import { LightRays } from "@/components/layout/LightRays"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DeckCard } from "@/components/decks/DeckCard"
import { NumberTicker } from "@/components/ui/number-ticker"
import { getDeckStats, getLatestDeck, type DeckStats } from "@/lib/api/stats"
import type { Database } from "@/types/supabase"

type Deck = Database['public']['Tables']['decks']['Row']

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [currentStatIndex, setCurrentStatIndex] = useState(0)
  const [deckStats, setDeckStats] = useState<DeckStats | null>(null)
  const [featuredDeck, setFeaturedDeck] = useState<Deck | null>(null)
  const [loading, setLoading] = useState(true)

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [stats, deck] = await Promise.all([
          getDeckStats(),
          getLatestDeck()
        ])
        setDeckStats(stats)
        setFeaturedDeck(deck)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Rotate stats every 5 seconds (only 2 stats now)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatIndex((prev) => (prev + 1) % 2)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

 
  const maxCurveCount = deckStats ? Math.max(...deckStats.avgManaCurve.map(c => c.count)) : 1

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin" style={{ color: 'var(--mana-color)' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Ocean gradient background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(farthest-corner at 50% 0%, var(--bg-tinted) 0%, var(--background) 100%)'
        }}
      />
      
      {/* Overlay gradient for better content visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background pointer-events-none" />
      
      {/* Ocean Light Rays - GPU accelerated */}
      <LightRays 
        count={32} 
        color="var(--mana-color"
      />
      
      <div className="relative">
        <section className="pt-24 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1
                className="text-5xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r"
                style={{
                  backgroundImage: `linear-gradient(to right, var(--gradient-start), var(--gradient-end))`
                }}
              >
                DefCat's DeckVault
              </h1>
              <p className="text-xl text-muted-foreground">
                Premium cEDH decklists from our community patrons
              </p>
            </div>

            {/* Search and Filters */}
            <div className="w-full max-w-2xl mx-auto mb-16">
              <div className="relative mb-6">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search commanders, archetypes, or strategies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 rounded-2xl glass border border-white/10 text-foreground text-lg placeholder-muted-foreground focus:outline-none focus:ring-2 transition-all"
                  style={{
                    '--tw-ring-color': 'var(--mana-color)',
                  } as React.CSSProperties}
                />
              </div>


              {selectedColors.length > 0 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  <ManaSymbols mana={selectedColors} size="lg" cost shadow />
                  <button
                    onClick={() => setSelectedColors([])}
                    className="ml-2 text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Stats Overview */}
        {deckStats && (
          <section className="py-12 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {/* Total Decks */}
                <Card className="glass border-white/10 bg-card-tinted">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Decks
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      <NumberTicker value={deckStats.totalDecks} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Curated cEDH lists
                    </p>
                  </CardContent>
                </Card>

                {/* Total Commanders */}
                <Card className="glass border-white/10 bg-card-tinted">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Unique Commanders
                    </CardTitle>
                    <Crown className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      <NumberTicker value={deckStats.totalCommanders} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Legendary leaders
                    </p>
                  </CardContent>
                </Card>

                {/* Rotating Stat Card */}
                <Card className="glass border-white/10 bg-card-tinted md:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {currentStatIndex === 0 && "Most Popular Commander"}
                      {currentStatIndex === 1 && "Most Common Card"}
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {currentStatIndex === 0 && deckStats.mostPopularCommander && (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold mb-1">
                            {deckStats.mostPopularCommander.name}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Appears in {deckStats.mostPopularCommander.count} decks
                          </p>
                        </div>
                        <ManaSymbols
                          mana={deckStats.mostPopularCommander.colors}
                          size="2x"
                          cost
                          shadow
                        />
                      </div>
                    )}
                    {currentStatIndex === 1 && deckStats.mostCommonCard && (
                      <div>
                        <div className="text-2xl font-bold mb-1">
                          {deckStats.mostCommonCard.name}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          In {deckStats.mostCommonCard.percentage.toFixed(1)}% of all decks ({deckStats.mostCommonCard.count})
                        </p>
                      </div>
                    )}
                    {/* Progress indicators */}
                    <div className="flex gap-1 mt-3">
                      {[0, 1].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-1 rounded-full flex-1 transition-all",
                            i === currentStatIndex ? "bg-muted-foreground" : "bg-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Mana Curve & Color Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                {/* Average Mana Curve */}
                <Card className="glass border-white/10 bg-card-tinted">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Average Mana Curve
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Aggregated across all decks
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-2 h-48">
                      {deckStats.avgManaCurve.map((data) => {
                        const heightPercentage = (data.count / maxCurveCount) * 100
                        return (
                          <div key={data.cmc} className="flex-1 flex flex-col items-center gap-2">
                            <div className="text-xs font-medium text-muted-foreground">
                              {data.count}
                            </div>
                            <div
                              className="w-full rounded-t-lg transition-all duration-300 hover:brightness-110"
                              style={{
                                height: `${heightPercentage}%`,
                                backgroundColor: 'var(--mana-color)',
                                opacity: 0.8
                              }}
                            />
                            <div className="text-xs font-medium">
                              {data.cmc === 0 ? "0" : data.cmc === 7 ? "7+" : data.cmc}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Popular Color Identities */}
                <Card className="glass border-white/10 bg-card-tinted">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Top Color Identities
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Most played color combinations
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {deckStats.colorDistribution.map((dist, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="text-2xl font-bold text-muted-foreground/50 w-6">
                              #{index + 1}
                            </div>
                            <ManaSymbols
                              mana={dist.colors}
                              size="lg"
                              shadow
                              useGuildSymbols
                            />
                            <span className="text-sm font-medium">{dist.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">{dist.count}</div>
                            <div className="text-xs text-muted-foreground">decks</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Featured Deck */}
        {featuredDeck && (
          <section className="py-12 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="h-6 w-6" style={{ color: 'var(--mana-color)' }} />
                <h2 className="text-3xl font-bold">Latest Featured Deck</h2>
              </div>
              <DeckCard deck={featuredDeck} />
            </div>
          </section>
        )}
      </div>

      <style jsx global>{`
        @keyframes jumbo-animate {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .jumbo-background {
          background: linear-gradient(
            -45deg,
            var(--gradient-color-1),
            var(--gradient-color-2),
            var(--gradient-color-3),
            var(--gradient-color-4),
            var(--gradient-color-1)
          );
          background-size: 400% 400%;
          filter: blur(60px) saturate(150%);
          animation: jumbo-animate 20s ease infinite;
          transition: all 0.8s ease-in-out;
        }

        .dark .jumbo-background {
          filter: blur(80px) saturate(200%) brightness(0.8);
        }
      `}</style>
    </div>
  )
}