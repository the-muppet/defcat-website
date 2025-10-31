// components/decks/detail/DeckTabs.tsx
'use client'

import { useState, useEffect } from 'react'
import { List, Grid3x3, BarChart3, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlowingEffect } from '@/components/ui/glowEffect'
import { DeckListView } from './DeckListView'
import { DeckVisualView } from './DeckVisualView'
import { DeckStatsView } from './DeckStatsView'
import { DeckEmptyState } from './DeckEmptyState'
import type { DecklistCardWithCard, Deck, DeckInfo } from '@/types/supabase'

interface DeckTabsProps {
  deck: Deck & Partial<DeckInfo>
  cards: DecklistCardWithCard[]
}

export function DeckTabs({ deck, cards }: DeckTabsProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'visual' | 'stats'>('list')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(false)

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

  const toggleTypeFilter = (type: string) => {
    setSelectedType(selectedType === type ? null : type)
  }

  const moxfieldIcon = isDark
    ? 'https://assets.moxfield.net/assets/images/logo-text.svg'
    : 'https://assets.moxfield.net/assets/images/logo-text-color.svg'

  return (
    <div className="relative rounded-2xl border translate-z(0) md:rounded-3xl">
      <GlowingEffect
        blur={0}
        borderWidth={3}
        spread={80}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
      />
      <div className="bg-card border-2 rounded-2xl shadow-xl relative">
        {/* Tab Navigation */}
        <div className="border-b border-border bg-accent/30">
          <div className="flex items-center justify-between px-6">
            <div className="flex items-center">
              {[
                { id: 'list', icon: List, label: 'List View' },
                { id: 'visual', icon: Grid3x3, label: 'Visual' },
                { id: 'stats', icon: BarChart3, label: 'Statistics' },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as typeof activeTab)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all relative ${
                    activeTab === id
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {activeTab === id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {deck.public_url && (
                
                  href={deck.public_url}
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
          {cards.length === 0 ? (
            <DeckEmptyState deck={deck} moxfieldIcon={moxfieldIcon} />
          ) : (
            <>
              {activeTab === 'list' && (
                <DeckListView
                  cards={cards}
                  selectedType={selectedType}
                  onTypeSelect={toggleTypeFilter}
                />
              )}
              {activeTab === 'visual' && (
                <DeckVisualView
                  cards={cards}
                  selectedType={selectedType}
                  onTypeSelect={toggleTypeFilter}
                />
              )}
              {activeTab === 'stats' && (
                <DeckStatsView
                  cards={cards}
                  selectedType={selectedType}
                  onTypeSelect={toggleTypeFilter}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}