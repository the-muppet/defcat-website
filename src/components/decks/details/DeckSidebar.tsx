// components/decks/detail/DeckSidebar.tsx
import { BarChart3, Eye, Heart, Calendar, Grid3x3, ChartNoAxesColumn } from 'lucide-react'
import { GlowingEffect } from '@/components/ui/glowEffect'
import { ColorDistribution } from '@/components/decks'
import type { DecklistCardWithCard, Deck, DeckInfo } from '@/types/supabase'

interface DeckSidebarProps {
  deck: Deck & Partial<DeckInfo>
  cards: DecklistCardWithCard[]
  selectedType: string | null  // Add this
}

export function DeckSidebar({ deck, cards, selectedType }: DeckSidebarProps) {
  const mainboardCards = cards.filter((dc) => dc.board === 'mainboard')

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
              <StatCard
                icon={BarChart3}
                label="Total Cards"
                value={totalCards}
                color="amber"
              />
              <StatCard
                icon={Grid3x3}
                label="Unique Cards"
                value={uniqueCards}
                color="cyan"
              />
              <StatCard
                icon={ChartNoAxesColumn}
                label="Avg. CMC"
                value={avgCMC}
                color="pink"
              />
            </div>

            {/* Right Column - Engagement */}
            <div className="space-y-3">
              <StatCard
                icon={Eye}
                label="Views"
                value={deck.view_count?.toLocaleString() || 0}
                color="emerald"
              />
              <StatCard
                icon={Heart}
                label="Likes"
                value={deck.like_count?.toLocaleString() || 0}
                color="red"
              />
              <StatCard
                icon={Calendar}
                label="Updated"
                value={deck.last_updated_at ? new Date(deck.last_updated_at).toLocaleDateString() : 'N/A'}
                color="blue"
                small
              />
            </div>
          </div>
        </div>
      </div>

      {/* Color Distribution Card */}
      {cards.length > 0 && (
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
  )
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  color: 'amber' | 'cyan' | 'pink' | 'emerald' | 'red' | 'blue'
  small?: boolean
}

function StatCard({ icon: Icon, label, value, color, small }: StatCardProps) {
  const colorClasses = {
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-500' },
    pink: { bg: 'bg-pink-500/10', text: 'text-pink-500' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
    red: { bg: 'bg-red-500/10', text: 'text-red-500' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  }

  const { bg, text } = colorClasses[color]

  return (
    <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg border border-border hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-2">
        <div className={`${bg} rounded-full p-1.5`}>
          <Icon className={`h-4 w-4 ${text}`} />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className={`${small ? 'text-sm' : 'text-xl'} font-bold text-foreground`}>
            {value}
          </div>
        </div>
      </div>
    </div>
  )
}