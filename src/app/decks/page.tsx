/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
/** biome-ignore-all lint/a11y/noLabelWithoutControl: <explanation> */
'use client'

import { useState, useMemo, memo } from 'react'
import { ExternalLink, Filter, X, ChevronUp, ChevronDown } from 'lucide-react'
import { useDecks } from '@/lib/hooks/useDecks'
import { cn } from '@/lib/utils'
import type { Deck } from '@/types/core'
import { ManaSymbols } from '@/components/decks/ManaSymbols'
import { ColorIdentity } from '@/types/colors'
import { RoastButton } from '@/components/decks/RoastButton'

// Memoized deck row component
const DeckRow = memo(function DeckRow({ deck }: { deck: Deck }) {
  return (
    <tr className="border-b border-tinted hover:bg-accent-tinted transition-all">
      <td className="py-4 px-4">
        <a
          href={`/decks/${deck.id}`}
          className="block hover:text-[var(--mana-color)] transition-colors"
        >
          <div className="font-medium">{deck.name}</div>
          <div className="text-xs text-muted-foreground line-clamp-1 mt-1">{deck.description}</div>
        </a>
      </td>
      <td className="py-4 px-4">
        <div className="flex flex-wrap gap-1">
          {deck.commanders?.map((cmd, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-1 rounded bg-accent-tinted border border-tinted"
            >
              {cmd}
            </span>
          ))}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex justify-center">
          {deck.color_identity && <ManaSymbols mana={deck.color_identity} size="sm" />}
        </div>
      </td>
      <td className="py-4 px-4 text-right">{deck.view_count?.toLocaleString()}</td>
      <td className="py-4 px-4 text-right">{deck.like_count?.toLocaleString()}</td>
      <td className="py-4 px-4 text-right text-sm text-muted-foreground">
        {deck.updated_at ? new Date(deck.updated_at).toLocaleDateString() : '-'}
      </td>
      <td className="py-4 px-4 text-center">
        <a
          href={deck.moxfield_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[var(--mana-color)] hover:brightness-110 transition-all"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </td>
      <td className="py-4 px-4 text-center">
        <div className="flex items-center justify-center gap-2">
          {deck.moxfield_url && <RoastButton moxfieldUrl={deck.moxfield_url} variant="icon-only" />}
        </div>
      </td>
    </tr>
  )
})

export default function TableLayout() {
  const { data: decks = [], isLoading: loading, error } = useDecks()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'name' | 'commanders' | 'color_identity' | 'view_count' | 'like_count' | 'updated_at'>(
    'view_count'
  )
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(true)

  const colorOptions = [
    { code: 'W', name: 'White' },
    { code: 'U', name: 'Blue' },
    { code: 'B', name: 'Black' },
    { code: 'R', name: 'Red' },
    { code: 'G', name: 'Green' },
    { code: 'C', name: 'Colorless' },
    { code: 'WUBRG', name: 'WUBRG' },
  ]

  const filteredDecks = useMemo(() => {
    let filtered = [...decks]
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (deck) =>
          deck.name.toLowerCase().includes(query) ||
          deck.commanders?.some((cmd) => cmd.toLowerCase().includes(query)) ||
          (deck.description || null)?.toLowerCase().includes(query)
      )
    }
    if (selectedColors.length > 0) {
      filtered = filtered.filter((deck) => {
        return selectedColors.every((color) => {
          // Special handling for WUBRG
          if (color === 'WUBRG') {
            return ['W', 'U', 'B', 'R', 'G'].every((c) => deck.color_identity?.includes(c))
          }
          return deck.color_identity?.includes(color)
        })
      })
    }

    filtered.sort((a, b) => {
      let aVal: any = a[sortBy]
      let bVal: any = b[sortBy]

      if (sortBy === 'updated_at') {
        aVal = new Date(aVal || 0).getTime()
        bVal = new Date(bVal || 0).getTime()
      }

      if (sortBy === 'name' || sortBy === 'commanders') {
        const aStr = sortBy === 'commanders' ? (aVal?.[0] || '') : aVal
        const bStr = sortBy === 'commanders' ? (bVal?.[0] || '') : bVal
        return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
      }

      if (sortBy === 'color_identity') {
        const aLen = (aVal?.length || 0)
        const bLen = (bVal?.length || 0)
        return sortOrder === 'asc' ? aLen - bLen : bLen - aLen
      }

      return sortOrder === 'asc' ? (aVal || 0) - (bVal || 0) : (bVal || 0) - (aVal || 0)
    })
    return filtered
  }, [decks, searchQuery, selectedColors, sortBy, sortOrder])

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    )
  }

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const SortIcon = ({ column }: { column: 'name' | 'commanders' | 'color_identity' | 'view_count' | 'like_count' | 'updated_at' }) => {
    if (sortBy !== column) return null
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar with tinted styling */}
      <aside
        className={cn(
          'border-r border-tinted bg-card-tinted backdrop-blur-sm transition-all duration-300',
          showFilters ? 'w-72' : 'w-0 overflow-hidden'
        )}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Filters</h2>
            <button
              onClick={() => setShowFilters(false)}
              className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-accent-tinted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search with tinted input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Search</label>
            <input
              type="text"
              placeholder="Deck or commander..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-accent-tinted border border-tinted text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mana-color)] focus:border-[var(--mana-color)] transition-all"
            />
          </div>

          {/* Color Identity with mana symbols */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-muted-foreground">
                Color Identity
              </label>
              <button
                type="button"
                onClick={() => {
                  if (selectedColors.length === 7) {
                    setSelectedColors([])
                  } else {
                    setSelectedColors(['W', 'U', 'B', 'R', 'G', 'C', 'WUBRG'])
                  }
                }}
                className="text-xs text-[var(--mana-color)] hover:brightness-110 transition-all"
              >
                {selectedColors.length === 7 ? 'Clear All' : 'Select All'}
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {ColorIdentity.ORDER.map((letter) => {
                const colorInfo = ColorIdentity.getColorInfo(letter)
                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => toggleColor(letter)}
                    className={cn(
                      'flex items-center gap-3 p-2 rounded-lg transition-all duration-200',
                      selectedColors.includes(letter)
                        ? 'bg-accent-tinted ring-2 scale-100'
                        : 'hover:bg-accent-tinted/50 scale-95 opacity-70 hover:opacity-100'
                    )}
                    style={
                      selectedColors.includes(letter)
                        ? ({ '--tw-ring-color': colorInfo.color } as React.CSSProperties)
                        : undefined
                    }
                  >
                    <i
                      className={colorInfo.className}
                      style={{
                        fontSize: '24px',
                        color: selectedColors.includes(letter) ? colorInfo.color : undefined,
                      }}
                    />
                    <span className="text-base font-medium">{colorInfo.name}</span>
                  </button>
                )
              })}
              {selectedColors.includes('WUBRG') ? (
                <div
                  className="rounded-lg p-[2px] transition-all duration-200"
                  style={{
                    background: `linear-gradient(135deg, ${ColorIdentity.Colors.W}, ${ColorIdentity.Colors.U}, ${ColorIdentity.Colors.B}, ${ColorIdentity.Colors.R}, ${ColorIdentity.Colors.G})`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleColor('WUBRG')}
                    className="flex items-center gap-3 p-2 rounded-[6px] transition-all duration-200 w-full bg-card scale-100"
                  >
                    <div className="flex gap-0.5">
                      {['W', 'U', 'B', 'R', 'G'].map((letter) => {
                        const colorInfo = ColorIdentity.getColorInfo(letter)
                        return (
                          <i
                            key={letter}
                            className={colorInfo.className}
                            style={{ fontSize: '16px' }}
                          />
                        )
                      })}
                    </div>
                    <span className="text-base font-medium">5-Color</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => toggleColor('WUBRG')}
                  className="flex items-center gap-3 p-2 rounded-lg transition-all duration-200 hover:bg-accent-tinted/50 scale-95 opacity-70 hover:opacity-100"
                >
                  <div className="flex gap-0.5">
                    {['W', 'U', 'B', 'R', 'G'].map((letter) => {
                      const colorInfo = ColorIdentity.getColorInfo(letter)
                      return (
                        <i
                          key={letter}
                          className={colorInfo.className}
                          style={{ fontSize: '16px' }}
                        />
                      )
                    })}
                  </div>
                  <span className="text-base font-medium">5-Color</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedColors.length > 0) && (
            <div className="pt-4 border-t border-tinted">
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedColors([])
                }}
                className="text-sm text-[var(--mana-color)] hover:brightness-110 transition-all"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content with tinted elements */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 bg-card-tinted/80 backdrop-blur-md border-b border-tinted px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!showFilters && (
                <button
                  onClick={() => setShowFilters(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-tinted hover:bg-[var(--accent-tinted)] border border-tinted transition-all"
                >
                  <Filter className="h-4 w-4" />
                  Show Filters
                </button>
              )}
              <h1 className="text-2xl font-bold">Decklist Database</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredDecks.length} / {decks.length} decks
            </div>
          </div>
        </header>

        {/* Table with tinted styling */}
        <div className="p-6">
          {loading ? (
            <div className="text-center text-muted-foreground py-20">Loading decks...</div>
          ) : error ? (
            <div className="text-center text-destructive py-20">Error loading decks</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-tinted">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer"
                      >
                        Deck Name
                        {sortBy === 'name' ? (
                          <SortIcon column="name" />
                        ) : (
                          <div className="h-4 w-4 opacity-30 hover:opacity-60">
                            <ChevronUp className="h-4 w-4" />
                          </div>
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      <button
                        onClick={() => handleSort('commanders')}
                        className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer"
                      >
                        Commander(s)
                        {sortBy === 'commanders' ? (
                          <SortIcon column="commanders" />
                        ) : (
                          <div className="h-4 w-4 opacity-30 hover:opacity-60">
                            <ChevronUp className="h-4 w-4" />
                          </div>
                        )}
                      </button>
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                      <button
                        onClick={() => handleSort('color_identity')}
                        className="flex items-center gap-2 mx-auto hover:text-foreground transition-colors cursor-pointer"
                      >
                        Colors
                        {sortBy === 'color_identity' ? (
                          <SortIcon column="color_identity" />
                        ) : (
                          <div className="h-4 w-4 opacity-30 hover:opacity-60">
                            <ChevronUp className="h-4 w-4" />
                          </div>
                        )}
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                      <button
                        onClick={() => handleSort('view_count')}
                        className="flex items-center gap-2 ml-auto hover:text-foreground transition-colors cursor-pointer"
                      >
                        Views
                        {sortBy === 'view_count' ? (
                          <SortIcon column="view_count" />
                        ) : (
                          <div className="h-4 w-4 opacity-30 hover:opacity-60">
                            <ChevronUp className="h-4 w-4" />
                          </div>
                        )}
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                      <button
                        onClick={() => handleSort('like_count')}
                        className="flex items-center gap-2 ml-auto hover:text-foreground transition-colors cursor-pointer"
                      >
                        Likes
                        {sortBy === 'like_count' ? (
                          <SortIcon column="like_count" />
                        ) : (
                          <div className="h-4 w-4 opacity-30 hover:opacity-60">
                            <ChevronUp className="h-4 w-4" />
                          </div>
                        )}
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                      <button
                        onClick={() => handleSort('updated_at')}
                        className="flex items-center gap-2 ml-auto hover:text-foreground transition-colors cursor-pointer"
                      >
                        Updated
                        {sortBy === 'updated_at' ? (
                          <SortIcon column="updated_at" />
                        ) : (
                          <div className="h-4 w-4 opacity-30 hover:opacity-60">
                            <ChevronUp className="h-4 w-4" />
                          </div>
                        )}
                      </button>
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Link
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDecks.map((deck) => (
                    <DeckRow key={deck.id} deck={deck} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}